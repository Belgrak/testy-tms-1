# TestY TMS - Test Management System
# Copyright (C) 2022 KNS Group LLC (YADRO)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# Also add information on how to contact you by electronic and paper mail.
#
# If your software can interact with users remotely through a computer
# network, you should also make sure that it provides a way for users to
# get its source.  For example, if your program is a web application, its
# interface could display a "Source" link that leads users to an archive
# of the code.  There are many ways you could offer source, and different
# solutions will be better for different programs; see section 13 for the
# specific requirements.
#
# You should also get your employer (if you work as a programmer) or school,
# if any, to sign a "copyright disclaimer" for the program, if necessary.
# For more information on this, and how to apply and follow the GNU AGPL, see
# <http://www.gnu.org/licenses/>.

import json
from http import HTTPStatus
from operator import itemgetter

import pytest
from tests_representation.api.v1.serializers import TestSerializer
from tests_representation.choices import TestStatuses
from tests_representation.models import Test

from tests import constants
from tests.commons import RequestType, model_to_dict_via_serializer
from tests.error_messages import PERMISSION_ERR_MSG, REQUIRED_FIELD_MSG


@pytest.mark.django_db
class TestTestEndpoints:
    view_name_list = 'api:v1:test-list'
    view_name_detail = 'api:v1:test-detail'

    def test_list(self, api_client, authorized_superuser, test_factory, project):
        expected_instances = model_to_dict_via_serializer(
            [test_factory(project=project) for _ in range(constants.NUMBER_OF_OBJECTS_TO_CREATE)],
            TestSerializer,
            many=True
        )
        response = api_client.send_request(self.view_name_list, query_params={'project': project.id})
        for instance_dict in json.loads(response.content)['results']:
            assert instance_dict in expected_instances, f'{instance_dict} was not found in expected instances.'

    def test_retrieve(self, api_client, authorized_superuser, test):
        expected_dict = model_to_dict_via_serializer([test], TestSerializer)
        response = api_client.send_request(self.view_name_detail, reverse_kwargs={'pk': test.pk})
        actual_dict = json.loads(response.content)
        assert actual_dict == expected_dict, 'Actual model dict is different from expected'

    def test_partial_update(self, api_client, authorized_superuser, test, user):
        result_dict = {
            'id': test.id,
            'user': user.id
        }
        api_client.send_request(
            self.view_name_detail,
            result_dict,
            request_type=RequestType.PATCH,
            reverse_kwargs={'pk': test.pk}
        )
        result_user = Test.objects.get(pk=test.id).user
        assert result_user == user, f'Test user does not match. Expected user "{user}", ' \
                                    f'actual: "{result_user}"'

    @pytest.mark.parametrize('expected_status', [HTTPStatus.OK, HTTPStatus.BAD_REQUEST])
    def test_update(self, api_client, authorized_superuser, expected_status, test, user, test_case, test_plan):
        result_dict = {
            'id': test.id,
            'user': user.id
        }
        if expected_status == HTTPStatus.OK:
            result_dict['case'] = test_case.id
            result_dict['plan'] = test_plan.id

        response = api_client.send_request(
            self.view_name_detail,
            reverse_kwargs={'pk': test.pk},
            request_type=RequestType.PUT,
            expected_status=expected_status,
            data=result_dict
        )
        if expected_status == HTTPStatus.OK:
            result_user = Test.objects.get(pk=test.id).user
            assert result_user == user, f'Test user does not match. Expected user "{user}", ' \
                                        f'actual: "{result_user}"'
        else:
            assert json.loads(response.content)['case'][0] == REQUIRED_FIELD_MSG
            assert json.loads(response.content)['plan'][0] == REQUIRED_FIELD_MSG

    def test_test_cannot_be_deleted(self, api_client, authorized_superuser, test):
        assert Test.objects.count() == 1, 'Test was not created'
        api_client.send_request(
            self.view_name_detail,
            expected_status=HTTPStatus.METHOD_NOT_ALLOWED,
            request_type=RequestType.DELETE,
            reverse_kwargs={'pk': test.pk}
        )
        assert Test.objects.count(), f'Test with id "{test.id}" was not deleted.'

    @pytest.mark.parametrize('request_type', [RequestType.PATCH, RequestType.PUT])
    def test_archived_editable_for_admin_only(self, api_client, authorized_superuser, test_factory, user, request_type):
        api_client.force_login(user)
        test = test_factory(is_archive=True)
        response = api_client.send_request(
            self.view_name_detail,
            reverse_kwargs={'pk': test.pk},
            request_type=request_type,
            expected_status=HTTPStatus.FORBIDDEN,
            data={}
        )
        assert json.loads(response.content)['detail'] == PERMISSION_ERR_MSG

    @pytest.mark.parametrize('field_name', ['id', 'name', 'is_archive', 'last_status'])
    @pytest.mark.parametrize('descending', [True, False], ids=['desc', 'asc'])
    def test_ordering_pagination(self, api_client, authorized_superuser, test_factory, test_result_factory, field_name,
                                 descending, project):
        number_of_pages = 2
        number_of_objects = constants.NUMBER_OF_OBJECTS_TO_CREATE_PAGE * number_of_pages
        tests = [test_factory(is_archive=idx % 2, project=project) for idx in range(number_of_objects)]
        for idx, expected_instance in enumerate(tests):
            if idx % 2:
                test_result_factory(test=expected_instance, status=TestStatuses.FAILED)
            elif idx % 3:
                test_result_factory(test=expected_instance, status=TestStatuses.SKIPPED)
            else:
                test_result_factory(test=expected_instance, status=TestStatuses.PASSED)
        expected_instances = model_to_dict_via_serializer(
            tests,
            TestSerializer,
            many=True
        )

        expected_instances = sorted(
            expected_instances,
            key=itemgetter(field_name),
            reverse=descending
        )

        for page_number in range(1, number_of_pages + 1):
            response = api_client.send_request(
                self.view_name_list,
                query_params={
                    'ordering': f'{"-" if descending else ""}{field_name if field_name != "name" else "case_name"}',
                    'is_archive': True,
                    'page': page_number,
                    'project': project.id
                }
            )
            response_dict = json.loads(response.content)['results']

            assert len(response_dict) == constants.NUMBER_OF_OBJECTS_TO_CREATE_PAGE
            for expected_instance, actual_instance in zip(
                    expected_instances[:99] if page_number == 1 else expected_instances[100:],
                    json.loads(response.content)['results']
            ):
                assert expected_instance[field_name] == actual_instance[field_name]

    def test_search(self, api_client, authorized_superuser, test_factory, test_case_factory, project):
        number_of_cases = 2
        test_cases = [test_case_factory(), test_case_factory()]
        tests = [[], []]
        expected_instances = []
        for idx in range(constants.NUMBER_OF_OBJECTS_TO_CREATE):
            if idx % 2:
                tests[0].append(test_factory(case=test_cases[0], project=project))
            else:
                tests[1].append(test_factory(case=test_cases[1], project=project))

        for idx in range(number_of_cases):
            expected_instances.append(model_to_dict_via_serializer(tests[idx], TestSerializer, many=True))

        for idx in range(number_of_cases):
            response = api_client.send_request(
                self.view_name_list,
                query_params={
                    'search': test_cases[idx].name,
                    'is_archive': True,
                    'project': project.id
                }
            )
            response_dict = json.loads(response.content)['results']
            assert expected_instances[idx] == response_dict

    def test_last_status_filter(self, api_client, authorized_superuser, test_factory, test_result_factory, project):
        expected_instances = []
        for status in TestStatuses:
            test = test_factory(project=project)
            test_result_factory(test=test, status=status)
            expected_instances.append(model_to_dict_via_serializer([test], TestSerializer, many=False))

        for expected_instance, status in zip(expected_instances, TestStatuses):
            response = api_client.send_request(
                self.view_name_list,
                query_params={
                    'last_status': status.value,
                    'project': project.id
                }
            )
            assert [expected_instance] == json.loads(response.content)['results'], f'Filter by {status} unexpected json'

    @pytest.mark.parametrize('page_size', [1, 2, 5])
    def test_page_size(self, api_client, authorized_superuser, test_factory, page_size, project):
        expected_number_of_pages = constants.NUMBER_OF_OBJECTS_TO_CREATE // page_size
        for _ in range(constants.NUMBER_OF_OBJECTS_TO_CREATE):
            test_factory(project=project)
        response = api_client.send_request(
            self.view_name_list,
            query_params={'page_size': page_size, 'project': project.id}
        )
        assert expected_number_of_pages == json.loads(response.content)['pages']['total']
