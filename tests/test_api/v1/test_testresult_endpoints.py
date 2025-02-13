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

import pytest
from tests_representation.api.v1.serializers import TestResultSerializer
from tests_representation.choices import TestStatuses
from tests_representation.models import TestResult

from tests import constants
from tests.commons import RequestType, model_to_dict_via_serializer, model_with_base_to_dict
from tests.error_messages import PERMISSION_ERR_MSG


@pytest.mark.django_db(reset_sequences=True)
class TestResultEndpoints:
    view_name_list = 'api:v1:testresult-list'
    view_name_detail = 'api:v1:testresult-detail'

    def test_list(self, api_client, authorized_superuser, test_result_factory, project):
        expected_instances = model_to_dict_via_serializer(
            [test_result_factory(project=project) for _ in range(constants.NUMBER_OF_OBJECTS_TO_CREATE)],
            TestResultSerializer,
            many=True
        )

        response = api_client.send_request(self.view_name_list, query_params={'project': project.id})

        for instance_dict in json.loads(response.content):
            assert instance_dict in expected_instances, f'{instance_dict} was not found in expected instances.'

    def test_retrieve(self, api_client, authorized_superuser, test_result):
        expected_dict = model_with_base_to_dict(test_result)
        expected_dict['status'] = expected_dict['status'].value
        expected_dict['status_text'] = test_result.get_status_display()
        expected_dict['user_full_name'] = test_result.user.get_full_name()
        expected_dict['attachments'] = []
        expected_dict['steps_results'] = []
        response = api_client.send_request(self.view_name_detail, reverse_kwargs={'pk': test_result.pk})
        actual_dict = json.loads(response.content)
        actual_dict.pop('url')
        assert actual_dict == expected_dict, 'Actual model dict is different from expected'

    def test_partial_update(self, api_client, authorized_superuser, test_result, user):
        result_dict = {
            'id': test_result.id,
            'user': user.id
        }
        api_client.send_request(
            self.view_name_detail,
            result_dict,
            request_type=RequestType.PATCH,
            reverse_kwargs={'pk': test_result.pk}
        )
        result_user = TestResult.objects.get(pk=test_result.id).user
        assert result_user == user, f'Result users do not match. Expected user "{user}", ' \
                                    f'actual: "{result_user}"'

    def test_update(self, api_client, authorized_superuser, test_result, user):
        result_dict = {
            'id': test_result.id,
            'user': user.id,
            'test': test_result.test.id
        }
        api_client.send_request(
            self.view_name_detail,
            reverse_kwargs={'pk': test_result.pk},
            request_type=RequestType.PUT,
            expected_status=HTTPStatus.OK,
            data=result_dict
        )
        result_user = TestResult.objects.get(pk=test_result.id).user
        assert result_user == user, f'Result users do not match. Expected user "{user}", actual: "{result_user}"'

    def test_add_results_to_test(self, api_client, authorized_superuser, user, test_factory):
        tests = [test_factory(), test_factory()]
        for test in tests:
            result_dict = {
                'status': TestStatuses.UNTESTED,
                'user': user.id,
                'comment': constants.TEST_COMMENT,
                'test': test.id
            }
            api_client.send_request(
                'api:v1:testresult-list',
                expected_status=HTTPStatus.CREATED,
                request_type=RequestType.POST,
                data=result_dict,
            )
        assert TestResult.objects.count() == 2, 'Expected number of results was not created.'
        assert TestResult.objects.filter(test=tests[0]).count() == 1, f'Only 1 result should be on a test "{tests[0]}"'
        assert TestResult.objects.filter(test=tests[1]).count() == 1, f'Only 1 result should be on a test "{tests[1]}"'

    def test_get_results_by_test(self, api_client, test_result_factory, test_factory, authorized_superuser, project):
        test1 = test_factory()
        test2 = test_factory()

        dicts_test1 = model_to_dict_via_serializer(
            [test_result_factory(test=test1, project=project) for _ in range(constants.NUMBER_OF_OBJECTS_TO_CREATE)],
            TestResultSerializer,
            many=True
        )
        dicts_test2 = model_to_dict_via_serializer(
            [test_result_factory(test=test2, project=project) for _ in range(constants.NUMBER_OF_OBJECTS_TO_CREATE)],
            TestResultSerializer,
            many=True
        )

        response_test1 = api_client.send_request(
            'api:v1:testresult-list',
            expected_status=HTTPStatus.OK,
            request_type=RequestType.GET,
            query_params={'test': test1.id, 'project': project.id}
        )
        response_test2 = api_client.send_request(
            'api:v1:testresult-list',
            expected_status=HTTPStatus.OK,
            request_type=RequestType.GET,
            query_params={'test': test2.id, 'project': project.id}
        )
        actual_results1 = json.loads(response_test1.content)
        actual_results2 = json.loads(response_test2.content)
        assert actual_results1 and actual_results2
        assert len(actual_results1) == len(actual_results2)
        for result_test1, result_test2 in zip(actual_results1, actual_results2):
            assert result_test1 in dicts_test1, 'Response is different from expected one'
            assert result_test2 in dicts_test2, 'Response is different from expected one'

    @pytest.mark.parametrize('request_type', [RequestType.PATCH, RequestType.PUT])
    def test_archived_editable_for_admin_only(self, api_client, authorized_superuser, test_result_factory, user,
                                              request_type):
        api_client.force_login(user)
        test = test_result_factory(is_archive=True)
        response = api_client.send_request(
            self.view_name_detail,
            reverse_kwargs={'pk': test.pk},
            request_type=request_type,
            expected_status=HTTPStatus.FORBIDDEN,
            data={}
        )
        assert json.loads(response.content)['detail'] == PERMISSION_ERR_MSG
