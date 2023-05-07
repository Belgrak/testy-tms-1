import axiosTMS from "./axiosTMS";
import localStorageTMS from "./localStorageTMS";

export default class ProjectService {

    static getProjects() {
        return axiosTMS.get("api/v1/projects/")
    }

    static getTestPlans() {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/testplans/", config)
    }

    static getTests() {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/tests/", config)
    }

    static getTestResults() {
        const projectId = localStorageTMS.getCurrentProject().id
        let config = {
            params: {
                project: projectId
            },
        }
        return axiosTMS.get("api/v1/results/", config)
    }

    static getStatistics(id: number) {
        return axiosTMS.get(`api/v1/testplans/${id}/statistics/`)
    }

    static getMe() {
        return axiosTMS.get(`api/v1/users/me/`)
    }

    static getUsers() {
        return axiosTMS.get("api/v1/users/")
    }

    static createProject(project: { name: string, description: string }) {
        return axiosTMS.post("api/v1/projects/", project)
    }

    static patchProject(project: { name: string, description: string }, id: number) {
        return axiosTMS.patch("api/v1/projects/" + id.toString() + "/", project)
    }

    static deleteProject(id: number) {
        return axiosTMS.delete("api/v1/projects/" + id.toString() + "/")
    }
}
