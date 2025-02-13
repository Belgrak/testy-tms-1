import React, {useEffect, useMemo, useState} from "react";
import useStyles from "./styles.testcases";
import CreationCase from "./creation.case.component";
import CreationSuite from "./creation.suite.component";
import TableSuites from "./table.suites.component";
import SuiteCaseService from "../../services/suite.case.service";
import FolderSuites from "./folder.suites.component";
import {styled} from "@mui/material/styles";
import {TooltipProps} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import 'react-splitter-layout/lib/index.css';
import PaginationSuitesComponent from "./pagination.suites.component";
import {useParams, useNavigate} from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import useStylesGlobal from "../../styles/styles";
import {myCase} from "../models.interfaces";
import {useTranslation} from "react-i18next";
import localStorageTMS from "../../services/localStorageTMS";
import i18next from "i18next";
import {useMode} from "../../context/ColorModeContextProvider";


export const CustomWidthTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip  {...props} classes={{popper: className}}/>
))(() => ({
    [`& .MuiTooltip-tooltip`]: {
        marginLeft: 10,
        minWidth: 200,
        minHeight: 25,
        border: "1px solid #5c6900",
        color: "#4A4A4A",
        backgroundColor: '#fff4e5',
        fontSize: 15,
        textAlign: "start"
    },
    [`& .MuiTooltip-arrow`]: {
        "&:before": {
            border: "1px solid #5c6900",
            boxSizing: "border-box",
            backgroundColor: '#fff4e5'
        },
        fontSize: 25,
    },
}));

export interface treeSuite {
    id: number;
    level: number;
    name: string;
    children: treeSuite[];
    description: string;
    test_cases: myCase [];
    descendant_count: number;
}

export interface suite {
    test_cases: myCase[];
    id: number;
    name: string;
    parent: null | number;
    project: number;
    description: string;
    url: string;
}

export interface mainFieldInSuite {
    id: number;
    name: string;
    description: string;
}


const SuitesComponent = () => {
    const [, theme] = useMode();
    const formatter = new Intl.NumberFormat(i18next.language)
    const {t} = useTranslation();
    const classes = useStyles()
    const [showCreationCase, setShowCreationCase] = useState(false)
    const [showCreationSuite, setShowCreationSuite] = useState(false)
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [treeSuites, setTreeSuites] = useState<treeSuite[]>([])
    const [infoCaseForEdit, setInfoCaseForEdit] = useState<myCase | null>(null)
    const [infoSuiteForEdit, setInfoSuiteForEdit] = useState<mainFieldInSuite | null>(null)
    const [lastEditCase, setLastEditCase] = useState<number>(-1)
    const [selectedSuiteCome, setSelectedSuiteCome] = useState<mainFieldInSuite | null>(null)
    const [detailedCaseInfo, setDetailedCaseInfo] = useState<{ show: boolean, myCase: myCase }>(SuiteCaseService.getEmptyDetailedCaseInfo())
    const {selectedSuiteId} = useParams()
    const [selectedSuiteForTreeView, setSelectedSuiteForTreeView] = useState<treeSuite | undefined>(undefined)
    const navigate = useNavigate()
    const memoizedValueFolderStructureOfSuites = useMemo(() =>
            <FolderSuites selectedSuiteForTreeView={selectedSuiteForTreeView}/>,
        [treeSuites, selectedSuiteForTreeView]);
    const [countOfSuitesOnPage, setCountOfSuitesOnPage] = useState(parseInt(localStorageTMS.getElementByKey("countOfSuitesOnPage") ?? "20"));
    const start = 10
    const stop = 100
    const step = 5
    const classesGlobal = useStylesGlobal()


    useEffect(() => {
        SuiteCaseService.getTreeSuites().then((response) => {
            setTreeSuites(response.data)
        }).catch((e) => {
            console.log(e);
        });
    }, [])

    useEffect(() => {
        if (selectedSuiteId !== undefined && treeSuites.length > 0) {
            setSelectedSuiteForTreeView(treeSuites.find(suite => suite.id === parseInt(selectedSuiteId)))
        } else if (selectedSuiteId !== undefined) {
            SuiteCaseService.getTreeBySetSuite(parseInt(selectedSuiteId)).then((response) => {
                const t: treeSuite[] = response.data
                // t.forEach((treeSuite, index) => {
                //     SuiteCaseService.getCases(treeSuite.id).then((response) => {
                //         t[index].test_cases = response.data
                //         setSelectedSuiteForTreeView(t)
                //     })
                // })
                SuiteCaseService.getCases(t[0].id).then((response) => {
                    console.log(t)
                    t[0].test_cases = response.data
                    setSelectedSuiteForTreeView(t[0])
                })
            }).catch((e) => {
                if (e.response.status === 404) {
                    navigate("/testcases")
                }
            })
        } else {
            setSelectedSuiteForTreeView(undefined)
        }
    }, [selectedSuiteId])

    const handleShowCreationCase = () => {
        if (selectedSuiteForTreeView !== undefined) {
            setShowCreationCase(true)
            setSelectedSuiteCome({
                id: selectedSuiteForTreeView.id, name: selectedSuiteForTreeView.name,
                description: selectedSuiteForTreeView.description
            })
        }
    }

    const handleShowCreationSuite = () => {
        setShowCreationSuite(true)
        if (selectedSuiteForTreeView !== undefined) {
            setSelectedSuiteCome({
                id: selectedSuiteForTreeView.id, name: selectedSuiteForTreeView.name,
                description: selectedSuiteForTreeView.description
            })
        } else {
            setSelectedSuiteCome(null)
        }
    }

    function onChangeSuitesOnPage(e: any) {
        setCountOfSuitesOnPage(e.target.value)
        localStorageTMS.setElementByKey("countOfSuitesOnPage", e.target.value)
    }


    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: "30%",
            },
        },
    };

    // console.log(selectedSuiteForTreeView)
    return (
        <div className={classes.mainGrid}>
            <div className={classes.leftGrid}>
                {selectedSuiteForTreeView !== undefined && <TableSuites selected={selected} setSelected={setSelected}
                                                                        setShowCreationCase={setShowCreationCase}
                                                                        setShowCreationSuite={setShowCreationSuite}
                                                                        setSelectedSuiteCome={setSelectedSuiteCome}
                                                                        selectedSuiteForTreeView={selectedSuiteForTreeView}
                                                                        setSelectedSuiteForTreeView={setSelectedSuiteForTreeView}
                                                                        setInfoCaseForEdit={setInfoCaseForEdit}
                                                                        setInfoSuiteForEdit={setInfoSuiteForEdit}
                                                                        detailedCaseInfo={detailedCaseInfo}
                                                                        setDetailedCaseInfo={setDetailedCaseInfo}
                                                                        lastEditCase={lastEditCase}
                                                                        setLastEditCase={setLastEditCase}
                                                                        setTreeSuites={setTreeSuites}
                />}
                {selectedSuiteForTreeView === undefined &&
                    <PaginationSuitesComponent countOfSuitesOnPage={countOfSuitesOnPage} treeSuites={treeSuites}/>}
            </div>
            <div className={classes.rightGrid} style={{backgroundColor: theme.palette.rightDialogPart}}>
                <div className={classes.rightGridButtons}>
                    {selectedSuiteForTreeView !== undefined &&
                        <div>
                            <Button
                                data-cy="create-case"
                                sx={{
                                    margin: "15px 15px 0 15px",
                                    minWidth: "70%",
                                    height: "45%",
                                    backgroundColor: theme.palette.lightButton,
                                    color: theme.palette.text.primary,
                                }} onClick={handleShowCreationCase}>{t("suites.create_case")}</Button>
                            <CreationCase show={showCreationCase} setShow={setShowCreationCase}
                                          selectedSuiteCome={selectedSuiteCome} setTreeSuites={setTreeSuites}
                                          infoCaseForEdit={infoCaseForEdit}
                                          setInfoCaseForEdit={setInfoCaseForEdit}
                                          setDetailedCaseInfo={setDetailedCaseInfo}
                                          detailedCaseInfo={detailedCaseInfo}
                                          setLastEditCase={setLastEditCase}
                                          setSelectedSuiteForTreeView={setSelectedSuiteForTreeView}
                                          selectedSuiteForTreeView={selectedSuiteForTreeView}
                            />
                        </div>}
                    <Button data-cy="create-suite" sx={{
                        marginTop: "15px",
                        minWidth: "70%",
                        height: "45%",
                        backgroundColor: "#696969",
                        color: "#FFFFFF",
                        "&:hover": {
                            color: theme.palette.text.primary,
                        }
                    }} onClick={handleShowCreationSuite}>{t("suites.create_suite")}</Button>
                    <CreationSuite show={showCreationSuite} setShow={setShowCreationSuite}
                                   selectedSuiteCome={selectedSuiteCome} setTreeSuites={setTreeSuites}
                                   setSelectedSuiteForTreeView={setSelectedSuiteForTreeView}
                                   selectedSuiteForTreeView={selectedSuiteForTreeView}
                                   infoSuiteForEdit={infoSuiteForEdit}
                                   setInfoSuiteForEdit={setInfoSuiteForEdit}
                                   treeSuites={treeSuites}
                    />
                </div>
                {selectedSuiteForTreeView === undefined &&
                    <div>
                        <FormControl sx={{minWidth: "90%", margin: "25px 0px 0px 15px"}}
                                     className={classesGlobal.textFieldSelectCreationCaseSuite}>
                            <InputLabel>{t("suites.count")}</InputLabel>
                            <Select
                                value={countOfSuitesOnPage}
                                label={t("suites.count")}
                                onChange={(e) => onChangeSuitesOnPage(e)}
                                MenuProps={MenuProps}
                            >
                                {Array.from({length: (stop - start) / step + 1}, (_, i) => start + i * step).map((num, index) =>
                                    <MenuItem key={index}
                                              value={num}>{formatter.format(num)}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>}
                {selectedSuiteForTreeView !== undefined &&
                    <div className={classes.mainGridFolderStructure}>
                        {memoizedValueFolderStructureOfSuites}
                    </div>}
            </div>
        </div>
    )
        ;
}

export default SuitesComponent
