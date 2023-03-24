class DIService {

    /**
     * @description Allow setting a list of dependencies where index is the dependency name
     * @param {Object} options 
     */
    setDependencies(options) {
        if (options) {
            Object.assign(this, options);
        }
        return this;
    }

    /**
     * @description Get the missing dependencies based on a list of dependencies name
     * @param {Array} list 
     */
    getMissingDependencies(list) {
        const missing = [];
        for (let dependency of list) {
            !this[dependency] && missing.push(dependency);
        }
        return missing;
    }

    /**
     * @description Check all requided dependencies and throw an error 
     * @param {Array} list 
     */
    checkDependencies(list) {
        const missing = this.getMissingDependencies(list);
        if (missing?.length > 0) {
            throw new Error("Missing dependencies: " + missing.join(","));
        }
    }
}

module.exports = DIService;