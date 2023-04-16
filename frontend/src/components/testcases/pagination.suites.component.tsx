import {treeSuite} from "./suites.component";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import useStylesTestCases from "./styles.testcases"
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {useMode} from "../../context/ColorModeContextProvider";

interface Props {
    treeSuites: treeSuite[],
    countOfSuitesOnPage: number
}

const PaginationSuitesComponent: React.FC<Props> = ({treeSuites, countOfSuitesOnPage}) => {
    const [, theme] = useMode();
    const formatter = new Intl.NumberFormat(i18next.language)
    const {t} = useTranslation();
    const [page, setPage] = useState(1);
    const classes = useStylesTestCases()
    const [foundSuites, setFoundSuites] = useState<treeSuite[]>(treeSuites)

    useEffect(() => {
        setFoundSuites(treeSuites)
    }, [treeSuites])

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const foundSuites2 = treeSuites.filter(suite => suite.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFoundSuites(foundSuites2)
        setPage(1)
    }


    return (
        <div style={{display: "flex", flexDirection: "column", margin: "0 0 10px 30px"}}>
            <TextField
                id="searchSuites"
                onChange={(content) => onChangeName(content)}
                autoComplete="off"
                style={{width: "50%", margin: 10}}
                placeholder={t("suites.search") ?? ""}
                variant={"outlined"}
            />
            <div data-cy="list-of-suites">
                {foundSuites.slice(page * countOfSuitesOnPage - countOfSuitesOnPage,
                    page * countOfSuitesOnPage)
                    .map((suite) => (
                        <div key={suite.id} className={classes.suitePaper} style={{backgroundColor: theme.palette.rightDialogPart, border: '1px solid #666666'}}>
                            <Link className={classes.linkSuite} style={{color: theme.palette.text.primary}} to={`${suite.id}`}>
                                {suite.name}
                            </Link>
                            <div className={classes.numOfSuitesCases} style={{color: theme.palette.text.primary}}>{t("suites.child_suites")} {formatter.format(suite.descendant_count)}</div>
                        </div>
                    ))}
            </div>
            <Pagination
                count={Math.ceil(foundSuites.length / countOfSuitesOnPage)}
                page={page}
                onChange={(_, num) => setPage(num)}
                sx={{marginY: 1, marginX: 1}}
            />
        </div>
    )
}

export default PaginationSuitesComponent