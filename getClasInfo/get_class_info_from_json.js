module.exports = class JsonToDartClassInfo {
    #classData = {
        class: [

        ]
    };
    constructor(json,className) {
        this.#classData.class.push(this.#getClassInfo(json,className))
    }
    get result() { 
        this.#classData.class.reverse()
        return  this.#classData };

    #getClassInfo(data, className) {
        let classDetails = {
            className: className ?? "GeneratedDataModel",
            mutable: false,
            parameters: []
        }

        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const element = data[key];
                let parameterName = this.#getDartParameterName(key)
                let className = this.#handelMap(element, key)
                let dataTypeInfo = className ?? this.#getDartDataType(element, key)

                classDetails.parameters.push({
                    required: false,
                    name: parameterName,
                    dataType: `${dataTypeInfo?.dataType}?`,
                    inbuilt: dataTypeInfo.inbuilt ?? false,
                    className: dataTypeInfo.className ?? ""
                })
            }
        }
        return classDetails;
    }

    #handelMap(dataType, key) {
        let dataTypeString = JSON.stringify(dataType)
        if (dataTypeString.startsWith("{") && dataTypeString.endsWith("}")) {
            let className = this.#getDartClassName(key)
            let data = this.#getClassInfo(dataType, className)
            let duplicateClass = this.#checkIsDuplicateClass(this.#classData.class, data)
            if (duplicateClass != null) {
                return {
                    dataType:duplicateClass?.className, //`Map<${this.#getMapKeyDataType(duplicateClass?.parameters)},${duplicateClass?.className}>`,
                    inbuilt: false,
                    className: duplicateClass?.className
                };

            } else {

                this.#classData.class.push(data)
                return {
                    dataType:className, //`Map<${this.#getMapKeyDataType(data.parameters)},${className}>`,
                    inbuilt: false,
                    className: className
                };
            }
        }
        return null
    }

    #getDartDataType(dataType, key) {
        switch (typeof (dataType)) {
            case "string":
                return {
                    dataType: "String",
                    inbuilt: true,
                    className: ""
                };
            case "number":
                return {
                    dataType: "int",
                    inbuilt: true,
                    className: ""
                };
            case "boolean":
                return {
                    dataType: "bool",
                    inbuilt: true,
                    className: ""
                };
            case "object":
                if (Array.isArray(dataType)) {
                    return this.#handelList(dataType, key)
                }

                if (dataType == "null") return "Null?"
                return dataType
            default:
                return dataType;
        }
    }
    #getMapKeyDataType(parameters) {
        if (parameters == null || parameters?.length <= 0) return 'String';
        return parameters[0].dataType?.replace("?", "")
    }
    #handelList(dataType, key) {
        let className = this.#handelMap(dataType[0], key)
        let dataTypeInfo = className ?? this.#getDartDataType(dataType[0], key)
        return {
            dataType: `List<${dataTypeInfo?.dataType}>`,
            inbuilt: false,
            className: dataTypeInfo?.className
        }
    }

    #getDartParameterName(name) {
        if (name == null || name == "") throw Error("Please Enter a Valid Parameter Name")
        return this.#replaceUnderScoreWithTitle(name)
    }
    #getDartClassName(name) {
        if (name == null || name == "") throw Error("Please Enter a Valid Parameter Name")
        let result = this.#replaceUnderScoreWithTitle(name)
        return (result.charAt(0).toUpperCase() + result.slice(1))
    }
    #replaceUnderScoreWithTitle(name) {
        var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~{0-9}]/;
        const firstChar = name.charAt(0)
        if (format.test(firstChar)) {
            name = name.replace(firstChar, "")
        }
        let data = name.split(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/);
        let finalString = "";
        if (data.length > 0) {
            data.map((p, index) => {
                finalString += index != 0 ? (p.charAt(0).toUpperCase() + p.slice(1)) : p;
            })
        }
        return finalString
    }

    #checkIsDuplicateClass(array, search) {
        let jsonData = JSON.stringify(search.parameters)
        return array.find((data) => JSON.stringify(data.parameters) == jsonData)
    }

}

