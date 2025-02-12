import { TransformFnParams } from 'class-transformer'


export const ToBoolean = (param: TransformFnParams) => {
    if (param.value !== undefined) {
        return (
            param.value === 1 ||
            param.value === '1' ||
            param.value === 'true' ||
            param.value === true
        )
    }
}

export const ToBooleanNumber = (param: TransformFnParams) => {
    if (param.value !== undefined) {
        return param.value ? 1 : 0
    }
}

export const ToTrim = (param: TransformFnParams) => {
    if (typeof param.value === 'string') {
        return param.value.trim()
    }
}

export const ToInt = (param: TransformFnParams) => {
    if (param.value || param.value == 0) {
        const num = parseInt(param.value)
        if (!isNaN(num)) {
            return num
        }
    }
}

export const ToNumber = (param: TransformFnParams) => {
    if (param.value === null) {
        return null
    }

    if (param.value || param.value == 0) {
        const num = Number(param.value)
        if (!isNaN(num)) {
            return num
        }
    }
}

export const SplitToArray = (param: TransformFnParams) => {
    if (typeof param.value === 'string') {
        return param.value.split(',')
    }
    return []
}

export const SplitToUniqueArray = (param: TransformFnParams) => {
    if (typeof param.value === 'string') {
        const array = param.value.split(',')
        return Array.from(new Set(array))
    }
    return []
}

export const ToNumberArray = (param: TransformFnParams) => {
    if (Array.isArray(param.value)) {
        return param.value
            .map((i) => {
                const num = Number(i)
                if (!isNaN(num)) {
                    return num
                }
            })
            .filter((i) => i)
    }
    return []
}

export const FilterNull = (param: TransformFnParams) => {
    if (Array.isArray(param.value)) {
        return param.value.filter((i) => i !== null)
    }
    return []
}

export const SplitToJsonObject = (param: TransformFnParams) => {
    const json = {}
    if (typeof param.value === 'string') {
        const splits = param.value.split(';')
        splits.forEach((split) => {
            const [key, value] = split.split(',')
            json[key] = value
        })
    }
    return json
}

export const ToString = (param: TransformFnParams) => {
    if (param.value || param.value == 0 || param.value == false) {
        return param.value.toString()
    }
}

export const toIsoDateString = (value: string | Date) => {
    if (value && value instanceof Date) {
        return value.toISOString().substring(0, 10)
    } else if (typeof value == 'string' || value instanceof String) {
        return value.substring(0, 10)
    }
}

export const ToIsoDate = (param: TransformFnParams) => {
    if (param.value && param.value instanceof Date) {
        return param.value.toISOString().substring(0, 10)
    } else if (
        typeof param.value == 'string' ||
        param.value instanceof String
    ) {
        return param.value.substring(0, 10)
    }
}

export const ToUniqueArray = (param: TransformFnParams) => {
    if (Array.isArray(param.value)) {
        return Array.from(new Set(param.value))
    }
    return param.value
}
