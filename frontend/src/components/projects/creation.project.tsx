import {Card, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React from "react";
import ProjectService from "../../services/project.service";
import {project} from "../models.interfaces";
import {useTranslation} from "react-i18next";

interface Props {
    setProjects: (projects: project[]) => void
}

const CreationProject: React.FC<Props> = ({setProjects}) => {
    const {t} = useTranslation();
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")

    const onChangeProjectName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const onChangeProjectDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value)
    }

    const createProject = () => {
        ProjectService.createProject({name: name, description: description})
            .then(() =>
                ProjectService.getProjects()
                    .then((response) => {
                        setProjects(response.data)
                        setName("")
                        setDescription("")
                    })
            )
    }

    return (
        <Card elevation={3} style={{
            borderRadius: 15,
            margin:"10px 5px 20px 5px"
        }}>
            <div style={{
                alignItems: 'center',
                flexDirection: 'column',
                display: 'flex',
                paddingBottom: 20,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 10,
                    width: "85%"
                }}>
                    <Typography variant="h6"
                                style={{marginTop: 25, paddingRight: 5, width: 300}}>
                        {t("project_creation.project_title")}
                    </Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        placeholder={t("project_creation.input_title") ?? ""}
                        required
                        fullWidth
                        id="projectName"
                        name="projectName"
                        autoComplete="on"
                        autoFocus
                        value={name}
                        onChange={onChangeProjectName}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 10,
                    width: "85%"
                }}>
                    <Typography variant="h6"
                                style={{marginTop: 25, marginRight: 5, width: 300}}>
                        {t("project_creation.about_project")}
                    </Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        placeholder={t("project_creation.input_about") ?? ""}
                        multiline
                        minRows={6}
                        maxRows={12}
                        required
                        fullWidth
                        id="projectDescription"
                        name="projectDescription"
                        autoComplete="on"
                        value={description}
                        onChange={onChangeProjectDescription}
                    />
                </div>
                <div style={{
                    textAlign: 'right',
                    marginTop: 10,
                    width: "85%"
                }}>
                    <Button
                        data-cy="button-create-project"
                        onClick={createProject}
                        variant={'contained'}
                        color={'secondary'}
                    >
                        {t("project_creation.submit")}
                    </Button>
                </div>
            </div>

        </Card>
    )
}

export default CreationProject