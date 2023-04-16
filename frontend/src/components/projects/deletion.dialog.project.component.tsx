import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import {project} from "../models.interfaces";
import ProjectService from "../../services/project.service";
import {useTranslation} from "react-i18next";
import {useMode} from "../../context/ColorModeContextProvider";

interface Props {
    openDialogDeletion: boolean;
    setOpenDialogDeletion: (show: boolean) => void;
    selectedForDeletion: project | null;
    setProjects: (Projects: project[]) => void
}

const DeletionDialogProject: React.FC<Props> = ({
                                                    openDialogDeletion,
                                                    setOpenDialogDeletion,
                                                    selectedForDeletion,
                                                    setProjects
                                                }) => {
    const {t} = useTranslation();
    const [, theme] = useMode();
    const disagreeToDelete = () => setOpenDialogDeletion(false)

    const agreeToDelete = () => {
        if (selectedForDeletion) {
            ProjectService.deleteProject(selectedForDeletion.id).then(() => {
                ProjectService.getProjects().then((response) => {
                    setProjects(response.data)
                })
            }).catch((e) => {
                console.log(e);
            });
            setOpenDialogDeletion(false)
        }
    }

    return (
        <Dialog
            open={openDialogDeletion}
            onClose={disagreeToDelete}
        >
            <DialogContent>
                <DialogContentText sx={{fontSize: 20, color: theme.palette.text.primary}}>
                    {t("project_delete.warning")}
                    {selectedForDeletion ?
                    <em> {selectedForDeletion.name}</em> : ""}?
                    <br/>
                </DialogContentText>
                <DialogActions style={{padding: 0}}>
                    <Button
                        style={{
                            margin: "20px 4px 0px 5px",
                            width: "30%",
                            minWidth: "100px",
                            height: "30%",
                            backgroundColor: theme.palette.lightButton,
                            border: '1px solid',
                            color: theme.palette.text.primary,
                        }}
                        onClick={disagreeToDelete}
                        title={"Нет"}>
                        {t("project_delete.no")}
                    </Button>
                    <Button
                        style={{
                            margin: "20px 5px 0px 4px",
                            width: "30%",
                            minWidth: "100px",
                            height: "30%",
                            backgroundColor: theme.palette.darkGreyButton,
                            color: "white",
                        }}
                        onClick={agreeToDelete}
                        title={"Да"}>
                        {t("project_delete.yes")}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default DeletionDialogProject