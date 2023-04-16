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
    componentForDeletion: myCase | treeSuite | undefined,
    selectedForDeletion: number[],
    setSelectedForDeletion: (idCases: number[]) => void,
    selectedSuiteForTreeView: treeSuite,
    setSelectedSuiteForTreeView: (treeSuite: treeSuite) => void,
    setDetailedCaseInfo: (myCase: { show: boolean, myCase: myCase }) => void,
    detailedCaseInfo: { show: boolean, myCase: myCase }
}

const DeletionDialogElement: React.FC<Props> = ({
                                                    openDialogDeletion,
                                                    setOpenDialogDeletion,
                                                    componentForDeletion,
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

    function deleteFromSelectedForDeletion(indexInSelected: number, selectedForDeletion: number[]) {
        let newSelected: number[] = [];
        if (indexInSelected === 0) {
            newSelected = newSelected.concat(selectedForDeletion.slice(1));
        } else if (indexInSelected === selectedForDeletion.length - 1) {
            newSelected = newSelected.concat(selectedForDeletion.slice(0, -1));
        } else if (indexInSelected > 0) {
            newSelected = newSelected.concat(
                selectedForDeletion.slice(0, indexInSelected),
                selectedForDeletion.slice(indexInSelected + 1),
            );
        }
        return newSelected
    }

    function isTypeMyCase(obj: any): obj is myCase {
        if (obj !== undefined) {
            return obj.scenario !== undefined
        } else {
            return false
        }
    }

    function isTypeTreeSuite(obj: any): obj is treeSuite {
        if (obj !== undefined) {
            return obj.test_cases !== undefined
        } else {
            return false
        }
    }

    function agreeToDelete() {
        if (isTypeMyCase(componentForDeletion)) {
            SuiteCaseService.deleteCase(componentForDeletion.id).then(() => {
                if (detailedCaseInfo.show && detailedCaseInfo.myCase.id === componentForDeletion.id) {
                    setDetailedCaseInfo(SuiteCaseService.getEmptyDetailedCaseInfo())
                }
                SuiteCaseService.getTreeBySetSuite(selectedSuiteForTreeView.id).then((response) => {
                    setSelectedSuiteForTreeView(response.data)
                    const indexInSelected = selectedForDeletion.indexOf(componentForDeletion.id)
                    if (indexInSelected !== -1) {
                        setSelectedForDeletion(deleteFromSelectedForDeletion(indexInSelected, selectedForDeletion))
                    }
                }).catch((e) => {
                    console.log(e)
                })
            }).catch((e) => {
                console.log(e)
            })
        } else if (isTypeTreeSuite(componentForDeletion)) {
            if (selectedForDeletion.length > 0 && componentForDeletion.test_cases.length > 0) {
                let newSelected = selectedForDeletion
                componentForDeletion.test_cases.forEach((myCase: myCase) => {
                    const indexInSelected = newSelected.indexOf(myCase.id)
                    if (indexInSelected !== -1) {
                        newSelected = deleteFromSelectedForDeletion(indexInSelected, newSelected)
                    }
                })
                setSelectedForDeletion(newSelected)
            }
            SuiteCaseService.deleteSuite(componentForDeletion.id).then(() => {

                SuiteCaseService.getTreeBySetSuite(selectedSuiteForTreeView.id).then((response) => {
                    setSelectedSuiteForTreeView(response.data)
                }).catch((e) => {
                    if (e.response.status === 404) {
                        window.location.assign("/testcases");
                    }
                })
            }).catch((e) => {
                console.log(e)
            })
        }
        setOpenDialogDeletion(false)
    }

    return (
        <Dialog
            open={openDialogDeletion}
            onClose={disagreeToDelete}
        >
            <DialogContent>
                <DialogContentText style={{fontSize: 20, color: theme.palette.text.primary, whiteSpace: "pre"}}>
                    {(isTypeMyCase(componentForDeletion) && t("suite_delete.case_delete"))
                        || t("suite_delete.suite_delete")}
                    <br/>
                </DialogContentText>
                <DialogActions style={{padding: 0}}>
                    <Button
                        data-cy="disagree-to-delete"
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
                        {t("suite_delete.no")}
                    </Button>
                    <Button
                        data-cy="agree-to-delete"
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
                        {t("suite_delete.yes")}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default DeletionDialogElement