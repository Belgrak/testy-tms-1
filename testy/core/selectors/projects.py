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
from core.models import Project
from django.db import models
from django.db.models import OuterRef, QuerySet, Subquery
from tests_description.models import TestCase, TestSuite
from tests_representation.models import Test, TestPlan


class SubCount(Subquery):
    template = "(SELECT count(*) FROM (%(subquery)s) _count)"
    output_field = models.IntegerField()


class ProjectSelector:

    @staticmethod
    def project_list() -> QuerySet[Project]:
        return QuerySet(model=Project).order_by('name')

    @staticmethod
    def project_by_id(project_id: int) -> Project:
        return QuerySet(model=Project).get(pk=project_id)

    @staticmethod
    def project_list_statistics():
        cases_count = TestCase.objects.filter(project_id=OuterRef('pk')).values('pk')
        suites_count = TestSuite.objects.filter(project_id=OuterRef('pk')).values('pk')
        plans_count = TestPlan.objects.filter(project_id=OuterRef('pk'), is_archive=False).values('pk')
        tests_count = Test.objects.filter(project_id=OuterRef('pk'), is_archive=False).values('pk')
        return Project.objects.annotate(
            cases_count=SubCount(cases_count),
            suites_count=SubCount(suites_count),
            plans_count=SubCount(plans_count),
            tests_count=SubCount(tests_count)
        )
