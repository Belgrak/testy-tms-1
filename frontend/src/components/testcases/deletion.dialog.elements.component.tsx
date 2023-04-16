import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import React from "react";
import SuiteCaseService from "../../services/suite.case.service";
import {treeSuite} from "./suites.component";
import {myCase} from "../models.interfaces";
import {useTranslation} from "react-i18next";
import {useMode} from "../../context/ColorModeContextProvider";

interface Props {
    openDialogDeletion: boolean,
    setOpenDialogDeletion: (show: boolean) => void,
    selectedForDeletion: number[],
    setSelectedForDeletion: (idCases: number[]) => void
    selectedSuiteForTreeView: treeSuite,
    setSelectedSuiteForTreeView: (treeSuite: treeSuite) => void,
    setDetailedCaseInfo: (myCase: { show: boolean, myCase: myCase }) => void,
    detailedCaseInfo: { show: boolean, myCase: myCase }
}

const DeletionDialogElements: React.FC<Props> = ({
                                                     openDialogDeletion,
                                                     setOpenDialogDeletion,
                                                     selectedForDeletion,
                                                     setSelectedForDeletion,
                                                     selectedSuiteForTreeView,
                                                     setSelectedSuiteForTreeView,
                                                     setDetailedCaseInfo,
                                                     detailedCaseInfo
                                                 }) => {
    const [, theme] = useMode();
    const {t} = useTranslation();

    function disagreeToDelete() {
        setOpenDialogDeletion(false)
    }

    async function agreeToDelete() {
        SuiteCaseService.deleteCases(selectedForDeletion).then(() => {
            if (detailedCaseInfo.show && selectedForDeletion.indexOf(detailedCaseInfo.myCase.id) !== -1) {
                setDetailedCaseInfo(SuiteCaseService.getEmptyDetailedCaseInfo())
            }
            SuiteCaseService.getTreeBySetSuite(selectedSuiteForTreeView.id).then((response) => {
                setSelectedSuiteForTreeView(response.data)
                setSelectedForDeletion([])
            }).catch((e) => {
                console.log(e)
            })
        }).catch((e) => {
            console.log(e)
        })
        setOpenDialogDeletion(false)
    }

    return (
        <Dialog
            open={openDialogDeletion}
            onClose={disagreeToDelete}
        >
            <DialogContent>
                <DialogContentText style={{fontSize: 20, color: theme.palette.text.primary, whiteSpace: "pre"}}>
                    {t("cases_delete.cases_delete")}
                    <br/>
                </DialogContentText>
                <DialogActions style={{padding: 0}}>
                    <Button
                        data-cy="disagree-to-delete-using-checkbox"
                        style={{
                            margin: "20px 4px 0px 5px",
                            width: "30%",
                            minWidth: 100,
                            height: "30%",
                            backgroundColor: theme.palette.lightButton,
                            color: theme.palette.text.primary,
                        }}
                        onClick={disagreeToDelete}
                        title={"Нет"}>
                        {t("cases_delete.no")}
                    </Button>
                    <Button
                        data-cy="agree-to-delete-using-checkbox"
                        style={{
                            margin: "20px 5px 0px 4px",
                            width: "30%",
                            minWidth: 100,
                            height: "30%",
                            backgroundColor: theme.palette.darkGreyButton,
                            color: "white",
                        }}
                        onClick={agreeToDelete}
                        title={"Да"}>
                        {t("cases_delete.yes")}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default DeletionDialogElements