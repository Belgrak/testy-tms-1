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
import mimetypes
import os

from core.models import Attachment
from django.conf import settings
from django.contrib.admin.utils import unquote
from django.http import FileResponse
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class MediaView(APIView):
    permission_classes = [AllowAny, ]

    def get(self, request, path):
        if not os.path.exists(f'{settings.MEDIA_ROOT}/{path}'):
            return Response('File does not exist.', status=status.HTTP_404_NOT_FOUND)
        mimetype, encoding = mimetypes.guess_type(path, strict=True)
        if not mimetype:
            mimetype = 'text/html'
        file_path = unquote(os.path.join(settings.MEDIA_ROOT, path)).encode('utf-8')
        return FileResponse(open(file_path, 'rb'), content_type=mimetype)


class AttachmentView(APIView):
    permission_classes = [AllowAny, ]

    def get(self, request, pk):
        try:
            attachment = Attachment.objects.get(pk=pk)
        except Attachment.DoesNotExist:
            return Response('Attachment was not found', status=status.HTTP_404_NOT_FOUND)
        try:
            return FileResponse(attachment.file.file)
        except FileNotFoundError:
            return Response(status=status.HTTP_404_NOT_FOUND)
