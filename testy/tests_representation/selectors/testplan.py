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

import logging
from typing import Optional

from django.db import connection
from django.db.models import QuerySet
from mptt.querysets import TreeQuerySet
from tests_representation.choices import TestStatuses
from tests_representation.models import Parameter, TestPlan

from testy.selectors import MPTTSelector
from utils import form_tree_prefetch_objects

logger = logging.getLogger(__name__)


class TestPlanSelector:
    def _get_max_level(self) -> int:
        return MPTTSelector.model_max_level(TestPlan)

    @staticmethod
    def testplan_list_raw() -> QuerySet[TestPlan]:
        return TestPlan.objects.all()

    def testplan_list(self, is_archive: bool = False) -> QuerySet[TestPlan]:
        max_level = self._get_max_level()
        testplan_prefetch_objects = form_tree_prefetch_objects(
            nested_prefetch_field='child_test_plans',
            prefetch_field='child_test_plans',
            tree_depth=max_level,
            queryset_class=TestPlan,
            queryset_filter=None if is_archive else {'is_archive': False}
        )
        testplan_prefetch_objects.extend(
            form_tree_prefetch_objects(
                nested_prefetch_field='child_test_plans',
                prefetch_field='parameters',
                tree_depth=max_level,
                queryset_class=Parameter
            )
        )
        return TestPlan.objects.all().prefetch_related(
            *testplan_prefetch_objects
        )

    def testplan_project_root_list(self, project_id: int) -> QuerySet[TestPlan]:
        return QuerySet(model=TestPlan).filter(project=project_id, parent=None).order_by('name')

    def testplan_get_by_pk(self, pk) -> Optional[TestPlan]:
        return TestPlan.objects.get(pk=pk)

    def testplan_without_parent(self, is_archive: bool = False, children_ordering: str = None) -> QuerySet[TestPlan]:
        max_level = self._get_max_level()
        children_ordering = ['-started_at'] if not children_ordering else children_ordering.split(',')
        testplan_prefetch_objects = form_tree_prefetch_objects(
            nested_prefetch_field='child_test_plans',
            prefetch_field='child_test_plans',
            tree_depth=max_level,
            queryset_class=TestPlan,
            queryset_filter=None if is_archive else {'is_archive': False},
            order_by_fields=children_ordering
        )
        testplan_prefetch_objects.extend(
            form_tree_prefetch_objects(
                nested_prefetch_field='child_test_plans',
                prefetch_field='parameters',
                tree_depth=max_level,
                queryset_class=Parameter,
            )
        )
        return QuerySet(model=TestPlan).filter(parent=None).order_by('-created_at').prefetch_related(
            *testplan_prefetch_objects,
        )

    @staticmethod
    def testplan_list_ancestors(instance: TestPlan) -> TreeQuerySet[TestPlan]:
        return instance.get_ancestors(include_self=True).prefetch_related('parameters')

    def testplan_statistics(self, test_plan):
        test_plan_child_ids = tuple(test_plan.get_descendants(include_self=True).values_list('pk', flat=True))
        query = """
                    SELECT   Count(*),
                             COALESCE(
                                        (
                                        SELECT   status
                                        FROM     tests_representation_testresult tr
                                        WHERE    tr.test_id = t.id
                                        ORDER BY id DESC limit 1 ), %s ) status
                    FROM     tests_representation_test t
                    WHERE    plan_id IN %s
                    GROUP BY status
                """

        with connection.cursor() as cursor:
            cursor.execute(query, [TestStatuses.UNTESTED, test_plan_child_ids])
            rows = cursor.fetchall()

        result = [
            {
                "label": status[1].upper(),
                "value": 0
            } for status in TestStatuses.choices if status[0] not in [row[1] for row in rows]
        ]

        for row in rows:
            result.append({"label": TestStatuses(row[1]).name, "value": row[0]})
        return sorted(result, key=lambda d: d['value'], reverse=True)
