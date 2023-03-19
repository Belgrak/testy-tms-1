import React, {useEffect} from "react";
import {myCase} from "../models.interfaces";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import SuiteCaseService from "../../services/suite.case.service";
import Attachments from "../attachment/attachments";
import {attachment} from "../models.interfaces";
import {useTranslation} from "react-i18next";

interface Props {
    myCase: myCase;
    setDetailedCaseInfo: (data: { show: boolean, myCase: myCase }) => void
}

const DetailedCaseInfo: React.FC<Props> = ({myCase, setDetailedCaseInfo}) => {
    const {t} = useTranslation();
    const [, setAttachments] = React.useState<attachment[]>()
    useEffect(() => {
        SuiteCaseService.getCaseById(myCase.id).then((response) => {
                myCase.attachments = response.data.attachments
                setAttachments(response.data.attachments)
            }
        )
    }, [myCase])

    return (
        <Grid style={{padding: 20, wordBreak: "break-word"}}>
            <Grid>
                <Grid style={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="h6">
                        {t("cases.title")}
                    </Typography>
                    <IconButton data-cy="close-info-case" size={"small"}
                                onClick={() => setDetailedCaseInfo(SuiteCaseService.getEmptyDetailedCaseInfo())}>
                        <CloseIcon/>
                    </IconButton>
                </Grid>
                <Grid data-cy="detailed-info-case-name">
                    {myCase.name}
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>
            <Grid>
                <Typography variant="h6">
                    {t("cases.scenario")}
                </Typography>
                <Grid data-cy="detailed-info-case-scenario">
                    {myCase.scenario}
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>
            {myCase.description && <Grid>
                <Typography variant="h6">
                    {t("cases.description")}
                </Typography>
                <Grid data-cy="detailed-info-case-setup">
                    {myCase.description}
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>}
            {myCase.setup && <Grid>
                <Typography variant="h6">
                    {t("cases.setup")}
                </Typography>
                <Grid data-cy="detailed-info-case-setup">
                    {myCase.setup}
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>}
            {myCase.teardown && <Grid>
                <Typography variant="h6">
                    {t("cases.teardown")}
                </Typography>
                <Grid data-cy="detailed-info-case-teardown">
                    {myCase.teardown}
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>}
            {myCase.estimate && <Grid>
                <Typography variant="h6">
                    {t("cases.estimate")}
                </Typography>
                <Grid data-cy="detailed-info-case-estimate">
                    {myCase.estimate}
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>}
            {myCase.attachments && myCase.attachments?.length !== 0 && <Grid>
                <Typography variant="h6">
                    {t("cases.attachments")}
                </Typography>
                <Grid>
                    <Attachments attachments={myCase.attachments}/>
                </Grid>
                <Divider style={{margin: "10px 0px 10px 0px"}}/>
            </Grid>}
        </Grid>
    )
}

export default DetailedCaseInfo