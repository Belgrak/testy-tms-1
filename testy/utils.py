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
import os
import time
from contextlib import contextmanager
from hashlib import md5
from typing import Any, Callable, Dict, List, Union

from celery_progress.backend import ProgressRecorder
from django.db.models import Prefetch


class ProgressRecorderContext(ProgressRecorder):
    def __init__(self, task, total, debug=False, description='Task started'):
        self.debug = debug
        self.current = 0
        self.total = total
        if self.debug:
            return
        super().__init__(task)
        self.set_progress(current=self.current, total=total, description=description)

    @contextmanager
    def progress_context(self, description):
        if self.debug:
            logging.info(description)
            yield
            return
        self.current += 1
        self.set_progress(self.current, self.total, description)
        yield

    def clear_progress(self):
        self.current = 0


def get_attachments_file_path(instance, filename):
    _, extension = os.path.splitext(filename)
    filename = f'{md5(str(time.time()).encode()).hexdigest()}{extension}'
    return f'attachments/{filename[0:2]}/{filename}'


def parse_bool_from_str(value):
    if str(value).lower() in ['1', 'yes', 'true']:
        return True
    return False


def form_tree_prefetch_lookups(nested_prefetch_field: str, prefetch_field: str, tree_depth) -> List[str]:
    """
    Form list of lookups for nested objects.

    Args:
        nested_prefetch_field: child field for instance
        prefetch_field: field to be prefetched on child
        tree_depth: MPTTModel max tree depth

    Returns:
        List of prefetch lookups. Where first element is prefetch field

    Example:
        Form nested lookups for field test_cases for child_test_suites:
        input -> form_tree_prefetch_lookups('child_test_suites', 'test_cases', 2)
        output -> 'test_cases', 'child_test_suites__test_cases', 'child_test_suites__child_test_suites__test_cases'
    """
    queries = [prefetch_field]
    for count in range(1, tree_depth + 1):
        query = '__'.join([nested_prefetch_field for _ in range(count)]) + '__' + prefetch_field
        queries.append(query)
    return queries


def form_tree_prefetch_objects(
        nested_prefetch_field: str,
        prefetch_field: str,
        tree_depth: int,
        queryset_class,
        annotation: Dict[str, Any] = None,
        queryset_filter: Dict[str, Any] = None,
        order_by_fields: List[str] = None,
) -> List[Prefetch]:
    """
    Form a list of prefetch objects for MPTTModels prefetch.

    Args:
        nested_prefetch_field: child field name for prefetching
        prefetch_field: field name that will be prefetched in child
        tree_depth: MPTTModel element max depth
        queryset_class: Model class of queryset to be added inside prefetch object
        annotation: Dict for .annotate() method keys = fields, values = anything for annotation like Count()
        queryset_filter: Dict for .filter() method keys = fields, values = values to filter by in specified field

    Returns:
        List of Prefetch objects
    """
    if not order_by_fields:
        order_by_fields = []
    if not annotation:
        annotation = {}
    prefetch_objects_list = []
    for lookup_str in form_tree_prefetch_lookups(nested_prefetch_field, prefetch_field, tree_depth):
        if queryset_filter:
            qs = queryset_class.objects.filter(**queryset_filter).annotate(**annotation).order_by(*order_by_fields)
        else:
            qs = queryset_class.objects.all().annotate(**annotation).order_by(*order_by_fields)
        prefetch_objects_list.append(Prefetch(lookup_str, queryset=qs))
    return prefetch_objects_list


def get_breadcrumbs_treeview(instances, depth: int, title_method: Callable = None) -> Dict[str, Union[str, None]]:
    """
    Recursively get treeview dict of mptt tree model.

    Args:
        instances: ordered tree of ancestors for mptt tree element
        depth: len of tree -1
        title_method: method to get title, if not provided use model.name of instance
    """
    return {
        'id': instances[depth].id,
        'title': title_method(instances[depth]) if title_method else instances[depth].name,
        'parent': None if depth == 0 else get_breadcrumbs_treeview(instances, depth - 1, title_method)
    }
