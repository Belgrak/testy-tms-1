import React from 'react';
import Button from "@mui/material/Button";
import {Chip, Grid} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachmentService from "../../services/attachment.servise";
import useStyles from "../../styles/styles";
import {useTranslation} from "react-i18next";

interface Props {
    setFilesSelected: (files: File[]) => void;
    selectedFiles?: File[]
}

const AttachmentButton: React.FC<Props> = ({setFilesSelected, selectedFiles}) => {
    const {t} = useTranslation();
    const [attachments, setAttachments] = React.useState<File[]>(selectedFiles ?? [])

    const handleFileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;

        if (!fileList) return;

        setFilesSelected(Array.from(fileList));
        setAttachments(Array.from(fileList));
    };

    const handleDeleteFile = (index: number) => {
        if (attachments) {
            let copyAttach = attachments.slice()
            copyAttach.splice(index, 1)
            setFilesSelected(copyAttach);
            setAttachments(copyAttach);
        }
    }
    const classes = useStyles()
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <label style={{marginBottom: 5}} htmlFor="fileSelection">
                <Button
                    sx={{
                        backgroundColor: "#e0e0e0",
                        color: "#1d1d1d",
                        "&:hover": {
                            backgroundColor: "#d5d5d5",
                        }
                    }}
                    component="span"
                    variant="contained"
                >
                    {t("attachment.attach_file")}
                    <input
                        style={{position: "absolute", right: 0, opacity: 0, margin: 0, padding: 0, border: "none"}}
                        id="fileSelection"
                        name="file"
                        type="file"
                        multiple={true}
                        onChange={handleFileChange}
                    />
                </Button>
            </label>
            <Grid className={classes.stackTags}>
                {attachments && attachments.map((attachment, index) => (
                    <Grid key={index} style={{marginTop: 7}}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <DescriptionIcon sx={{marginTop: "4px"}}/>
                            <Chip key={index} label={AttachmentService.filenameReduce(attachment.name)}
                                  onDelete={() => handleDeleteFile(index)}/>
                        </div>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default AttachmentButton