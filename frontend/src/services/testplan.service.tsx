import axiosTMS from "./axiosTMS";
import {testPlan, testsQuery} from "../components/models.interfaces";
import localStorageTMS from "./localStorageTMS";

export default class TestPlanService {
    static getAllTestPlans() {
        return axiosTMS.get("api/v1/testplans/")
    }

    static async getTestPlan(id: number) {
        const testPlanData = await axiosTMS.get("api/v1/testplans/" + id + "/")
        const testPlan: testPlan = testPlanData.data
        const testsQuery = await this.getTests(testPlan.id)
        const tests = testsQuery.data.results
        testPlan.tests = testsQuery.data.results
        console.log(testPlan)
        for (const i of testPlan.tests) {
            const testResults = await this.getAllTestResults(i.id)
            i.test_results = testResults.data
        }
        //TODO убрать и подгружать только тогда, когда понадобится
        return testPlanData
    }

    static editTestPlan(testplan: { parent?: number; name: string; test_cases: number[]; due_date: string; is_archive: boolean; started_at: string; id: number; parameters?: number[] }) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.patch("api/v1/testplans/" + testplan.id + "/", testplan, config)
    }

    static async deleteTestPlans(id: number[]) {
        for (let i = 0; i < id.length; i++) {
            await this.deleteTestPlan(id[i]).catch((err) => console.log(err))
        }
    }

    static deleteTestPlan(id: number) {
        return axiosTMS.delete("api/v1/testplans/" + id + "/")
    }

    static getTreeTestPlans() {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        if (projectId) {
            return axiosTMS.get("api/v1/projects/" + projectId + "/testplans/")
        } else {
            return axiosTMS.get("api/v1/projects/1/testplans/")
        }
    }

    static getParameters() {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        if (projectId) {
            return axiosTMS.get("api/v1/parameters/?project=" + projectId)
        } else {
            return axiosTMS.get("api/v1/parameters/")
        }

    }

    static getAllTestResults(id: number) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/results/?test=" + id, config)
    }

    static getTestResult(id: number) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/results/" + id + "/", config)
    }

    static createTestPlan(testPlan: { name: string, project: number, started_at: string, due_date: string, description?: string, parent?: number, test_cases: number[], parameters: number[] }) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.post("api/v1/testplans/", testPlan, config)
    }

    static createTestResult(testResult: { status: number, comment: string, execution_time: number | null, test: number }) {
        return axiosTMS.post("api/v1/results/", testResult)
    }

    static getTest(id: number) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/tests/" + id, config)
    }

    static getTests(plan: number) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/tests/?plan=" + plan, config)
    }

    static editTest(id: number, test: { case: number, plan: number, user: number, is_archive: boolean }) {
        return axiosTMS.patch("api/v1/tests/" + id + "/", test)
    }

    static getStatistics(id: number) {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/testplans/" + id + "/statistics/", config)
    }
}