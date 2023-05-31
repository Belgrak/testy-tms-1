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
from typing import Any, Dict, List, Tuple

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from testy.types import DjangoModelType

logger = logging.getLogger(__name__)


class ServiceModelMixin(models.Model):
    class Meta:
        abstract = True

    @classmethod
    def model_create(cls, fields: List[str], data: Dict[str, Any], commit: bool = True) -> DjangoModelType:
        actually_fields = {key: data[key] for key in fields if key in data}
        instance = cls(**actually_fields)

        if commit:
            instance.full_clean()
            instance.save()

        return instance

    def model_update(
            self, fields: List[str], data: Dict[str, Any], commit: bool = True, force: bool = False
    ) -> Tuple[DjangoModelType, bool]:
        has_updated = False

        for field in fields:
            if field not in data:
                continue

            if getattr(self, field) != data[field]:
                has_updated = True
                setattr(self, field, data[field])

        if (has_updated and commit) or force:
            self.full_clean()
            self.save(update_fields=fields)
        if not has_updated:
            logger.error('Model was not updated.')
        return self, has_updated


class SoftDeleteQuerySet(models.query.QuerySet):
    def delete(self, cascade=None):
        return self.update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)


class DeletedQuerySet(models.query.QuerySet):
    def restore(self, *args, **kwargs):
        qs = self.filter(*args, **kwargs)
        qs.update(is_deleted=False, deleted_at=None)


class DeletedManager(models.Manager):
    def get_queryset(self):
        return DeletedQuerySet(self.model, using=self._db).filter(is_deleted=True)


class SoftDeleteMixin(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    objects = SoftDeleteManager()
    deleted_objects = DeletedManager()

    def delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()

    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

    class Meta:
        abstract = True


class BaseModel(ServiceModelMixin, models.Model):
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        abstract = True
