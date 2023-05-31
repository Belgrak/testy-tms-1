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

from django.db.models import Count, QuerySet
from mptt.querysets import TreeQuerySet
from tests_description.models import TestCase, TestSuite

from testy.selectors import MPTTSelector
from utils import form_tree_prefetch_lookups, form_tree_prefetch_objects


class TestSuiteSelector:
    def _get_max_level(self) -> int:
        return MPTTSelector.model_max_level(TestSuite)

    @staticmethod
    def suite_list_raw() -> QuerySet[TestSuite]:
        return TestSuite.objects.all()

    def suite_list(self) -> QuerySet[TestSuite]:
        max_level = self._get_max_level()
        return (
            TestSuite.objects.all()
            .order_by("name")
            .prefetch_related(
                *form_tree_prefetch_lookups(
                    'child_test_suites',
                    'test_cases',
                    max_level,
                ),
                *form_tree_prefetch_lookups(
                    'child_test_suites',
                    'test_cases__attachments',
                    max_level,
                ),
            )
        )

    def suite_list_treeview(self, root_only: bool = True) -> QuerySet[TestSuite]:
        max_level = self._get_max_level()
        parent = {'parent': None} if root_only else {}
        return (
            QuerySet(model=TestSuite)
            .filter(**parent)
            .order_by('name')
            .prefetch_related(
                *form_tree_prefetch_objects(
                    nested_prefetch_field='child_test_suites',
                    prefetch_field='child_test_suites',
                    tree_depth=max_level,
                    queryset_class=TestSuite,
                    annotation={'cases_count': Count('test_cases')}
                )
            ).annotate(cases_count=Count('test_cases'))
        )

    def suite_list_treeview_with_cases(self, root_only: bool = True) -> QuerySet[TestSuite]:
        max_level = self._get_max_level()
        parent = {'parent': None} if root_only else {}
        return (
            QuerySet(model=TestSuite)
            .filter(**parent)
            .order_by('name')
            .prefetch_related(
                *form_tree_prefetch_objects(
                    nested_prefetch_field='child_test_suites',
                    prefetch_field='child_test_suites',
                    tree_depth=max_level,
                    queryset_class=TestSuite,
                    annotation={'cases_count': Count('test_cases')}
                ),
                *form_tree_prefetch_objects(
                    nested_prefetch_field='child_test_suites',
                    prefetch_field='test_cases',
                    tree_depth=max_level,
                    queryset_class=TestCase,
                ),
            ).annotate(cases_count=Count('test_cases'))
        )

    @staticmethod
    def suite_list_ancestors(instance: TestSuite) -> TreeQuerySet[TestSuite]:
        return instance.get_ancestors(include_self=True)
