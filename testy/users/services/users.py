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

from typing import Any, Dict

from django.contrib.auth import get_user_model

UserModel = get_user_model()


class UserService:
    non_side_effect_fields = ['username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active']

    def user_create(self, data: Dict[str, Any]) -> UserModel:
        user = UserModel.model_create(
            fields=self.non_side_effect_fields,
            data=data,
            commit=False,
        )
        user.set_password(data['password'])
        user.full_clean()
        user.save()
        return user

    def user_update(self, user: UserModel, data: Dict[str, Any]) -> UserModel:
        user, _ = user.model_update(
            fields=self.non_side_effect_fields,
            data=data,
            commit=False,
        )
        password = data.pop('password', None)
        if password:
            user.set_password(password)
        user.full_clean()
        user.save()
        return user

    def config_update(self, user: UserModel, config: Dict[str, Any]) -> Dict[str, Any]:
        user.config.update(config)
        user.full_clean(exclude=['password'])
        user.save()
        return user.config
