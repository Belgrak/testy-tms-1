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
import operator
from functools import reduce

from core.models import Attachment
from django.db import models
from django.db.models import OuterRef, Q, Subquery
from django_filters import rest_framework as filters
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from tests_description.models import TestCase, TestSuite
from tests_representation.models import Parameter, Test, TestPlan, TestResult

from utils import parse_bool_from_str


class TestyFilterBackend(filters.DjangoFilterBackend):
    def get_filterset_kwargs(self, request, queryset, view):
        kwargs = super().get_filterset_kwargs(request, queryset, view)
        kwargs.update({'action': view.action})
        return kwargs


class BaseProjectFilter(filters.FilterSet):
    def __init__(self, *args, action=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.action = action

    def filter_queryset(self, queryset):
        if self.data.get('project') is None and self.action == 'list':
            raise NotFound('Project id was not provided in query params')
        return super().filter_queryset(queryset)


class TestSuiteFilter(BaseProjectFilter):
    class Meta:
        model = TestSuite
        fields = ('project',)


class ArchiveFilter(BaseProjectFilter):

    def filter_queryset(self, queryset):
        if not parse_bool_from_str(self.data.get('is_archive')) and self.action == 'list':
            queryset = queryset.filter(is_archive=False)
        return super().filter_queryset(queryset)


class ProjectArchiveFilter(filters.FilterSet):

    def __init__(self, *args, action=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.action = action

    def filter_queryset(self, queryset):
        if not parse_bool_from_str(self.data.get('is_archive')) and self.action == 'list':
            queryset = queryset.filter(is_archive=False)
        return super().filter_queryset(queryset)


class TestCaseFilter(BaseProjectFilter):
    class Meta:
        model = TestCase
        fields = ('project', 'suite')


class ParameterFilter(BaseProjectFilter):
    class Meta:
        model = Parameter
        fields = ('project',)


class AttachmentFilter(BaseProjectFilter):
    class Meta:
        model = Attachment
        fields = ('project',)


class TestPlanFilter(ArchiveFilter):
    class Meta:
        model = TestPlan
        fields = ('project',)


class TestFilter(ArchiveFilter):
    def filter_queryset(self, queryset):
        last_status = self.data.get('last_status')
        if last_status:
            last_status = last_status.split(',')
            q_lookup = Q(last_status__in=last_status)
            if 'null' in last_status:
                last_status.remove('null')
                q_lookup = Q(last_status__in=last_status) | Q(last_status__isnull=True)

            queryset = queryset.annotate(
                last_status=Subquery(
                    TestResult.objects.filter(test_id=OuterRef("id")).order_by("-created_at").values('status')[:1]
                ),
            ).filter(q_lookup)
        return super().filter_queryset(queryset)

    class Meta:
        model = Test
        fields = ('project', 'plan',)


class TestResultFilter(ArchiveFilter):
    class Meta:
        model = TestResult
        fields = ('project', 'test',)


class TestOrderingFilter(OrderingFilter):

    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)
        if not ordering:
            return queryset

        return queryset.annotate(
            last_status=Subquery(
                TestResult.objects.filter(test_id=OuterRef("id")).order_by("-created_at").values('status')[:1]),
            case_name=Subquery(TestCase.objects.filter(pk=OuterRef('case_id')).values('name')[:1])
        ).order_by(*ordering)


class TestSearchFilter(SearchFilter):
    def filter_queryset(self, request, queryset, view):
        search_fields = self.get_search_fields(view, request)
        search_terms = self.get_search_terms(request)

        if not search_fields or not search_terms:
            return queryset

        orm_lookups = [
            self.construct_search(f'case__{search_field}')
            for search_field in search_fields
        ]

        conditions = []
        for search_term in search_terms:
            queries = [
                models.Q(**{orm_lookup: search_term})
                for orm_lookup in orm_lookups
            ]
            conditions.append(reduce(operator.or_, queries))
        queryset = queryset.filter(reduce(operator.and_, conditions))

        return queryset
