import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import {treeTestPlan} from "./testplans.component";
import TestPlanService from "../../services/testplan.service";
import {useTranslation} from "react-i18next";

interface Props {
    openDialogDeletion: boolean;
    setOpenDialogDeletion: (show: boolean) => void;
    selectedForDeletion: number[];
    setSelectedForDeletion: (idCases: number[]) => void;
    setTreeTestplans: (treeTestPlans: treeTestPlan[]) => void
}

const DeletionDialogTestPlans: React.FC<Props> = ({
                                                      openDialogDeletion,
                                                      setOpenDialogDeletion,
                                                      selectedForDeletion,
                                                      setSelectedForDeletion,
                                                      setTreeTestplans
                                                  }) => {
    const {t} = useTranslation();

    const disagreeToDelete = () => setOpenDialogDeletion(false)

    const agreeToDelete = () => {
        TestPlanService.deleteTestPlans(selectedForDeletion).then(() => {
            TestPlanService.getTreeTestPlans().then((response) => {
                setTreeTestplans(response.data)
            })
        })
            .catch((e) => {
                console.log(e);
            });
        setSelectedForDeletion([])
        setOpenDialogDeletion(false)
    }

    return (
        <Dialog
            open={openDialogDeletion}
            onClose={disagreeToDelete}
        >
            <DialogContent>
                <DialogContentText sx={{fontSize: 20, color: "black", whiteSpace: "pre"}}>
                    {t("plans_delete.plans_delete")}
                    <br/>
                </DialogContentText>
                <DialogActions style={{padding: 0}}>
                    <Button
                        sx={{
                            margin: "20px 4px 0px 5px",
                            width: "30%",
                            minWidth: "100px",
                            height: "30%",
                            backgroundColor: "#FFFFFF",
                            border: '1px solid',
                            color: "#000000",
                        }}
                        onClick={disagreeToDelete}
                        title={"Нет"}>
                        {t("plans_delete.no")}
                    </Button>
                    <Button
                        sx={{
                            margin: "20px 5px 0px 4px",
                            width: "30%",
                            minWidth: "100px",
                            height: "30%",
                            backgroundColor: "#696969",
                            color: "#FFFFFF",
                        }}
                        onClick={agreeToDelete}
                        title={"Да"}>
                        {t("plans_delete.yes")}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default DeletionDialogTestPlans