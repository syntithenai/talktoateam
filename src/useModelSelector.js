export default function useModelSelector({config, creditBalance, token, availableModels}) {
    // type can be - basic, small, medium, large, advanced, instruct, code
    
    function getModelScore(type) {
        let lookups = {
            'basic': 1,
            'small': 2,
            'medium': 3,
            'large': 4,
            'advanced': 5,
        }
        return lookups.hasOwnProperty(type) ? lookups[type] : 0
    }

    function hasCredit() {
        return (token && token.access_token && creditBalance > 0) ? true : false
    }

    function lookupModel(key) {
        let parts = key.split(' ')
        let provider = parts[0]
        let modelName = parts.slice(1).join(' ')
        let ret = null
        if (Array.isArray(availableModels)) {
            availableModels.forEach(function(model) {
                // console.log("COMPARE",model, provider,modelName)
                if (model.provider === provider && model.model === modelName) {
                    // console.log("OK")
                    ret = model
                }
            })
        }
        // console.log("LOOKUP",key,ret)    
        return ret
    }

    function getModelKey(type) {
        let model = getModel(type)
        // special case for using CORS llm provider directly, just the model name
        if (model && model.provider === 'openai' && config && config.llm && config.llm.openai_key) return model.model
        else if (model && model.provider === 'groqcloud' && config && config.llm && config.llm.groqcloud_key) return model.model
        // two part model key
        else if (model) return model.provider + ' ' + model.model
    }

    function getModel(type) {
        // console.log("getmodel",type,config, availableModels,creditBalance, token)
        let seekModel = null
        let seekModelObj = null
        if (config && config.llm && config.llm[type + "_model"]) {
            seekModel = config.llm[type + "_model"]
        }
        let models = availableModels
        // build indexes
        let modelTagIndex = {}
        models.forEach(function(model) {
            if (seekModel && seekModel.startsWith(model.provider) && seekModel.endsWith(model.model)) {
                seekModelObj = model
            }
            if (Array.isArray(model.tags)) {
                model.tags.forEach(function(tag) {
                    if (!Array.isArray(modelTagIndex[tag])) {
                        modelTagIndex[tag] = []
                    }
                    modelTagIndex[tag].push(model)
                })
            }
        })
        // early exit if fixed choice in place
        if (seekModel && seekModelObj) {
            // console.log("seek from selection",seekModel)
            return seekModelObj
        }
        Object.keys(modelTagIndex).forEach(function(tag) {
            modelTagIndex[tag] = modelTagIndex[tag].sort(function(a,b) {
                let priceA = (parseFloat(a.price_in) > 0 ? parseFloat(a.price_in) : 0) + (parseFloat(a.price_out) > 0 ? parseFloat(a.price_out) : 0)
                let priceB = (parseFloat(b.price_in) > 0 ? parseFloat(b.price_in) : 0) + (parseFloat(b.price_out) > 0 ? parseFloat(b.price_out) : 0)
                if (parseInt(a.parameters) < parseInt(b.parameters)) {
                    return 1
                } else if (parseInt(a.parameters) > parseInt(b.parameters)) {
                    return -1
                } else {
                    if (priceA < priceB) {
                        return -1
                    } else {
                        return 1
                    } 
                }
            })
        })
        // console.log(modelTagIndex)
        if (type === 'basic') {
            if (Array.isArray(modelTagIndex['basic']) && modelTagIndex['basic'].length > 0) {
                return modelTagIndex['basic'][0]
            } else if (Array.isArray(modelTagIndex['small']) && modelTagIndex['small'].length > 0) {
                return modelTagIndex['small'][0]
            } else if (Array.isArray(modelTagIndex['medium']) && modelTagIndex['medium'].length > 0) {
                return modelTagIndex['medium'][0]
            } else if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } else if (Array.isArray(modelTagIndex['advanced']) && modelTagIndex['advanced'].length > 0) {
                return modelTagIndex['advanced'][0]
            }
         } else if (type === 'small') {
            if (Array.isArray(modelTagIndex['small']) && modelTagIndex['small'].length > 0) {
                return modelTagIndex['small'][0]
            } else if (Array.isArray(modelTagIndex['medium']) && modelTagIndex['medium'].length > 0) {
                return modelTagIndex['medium'][0]
            } else if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } else if (Array.isArray(modelTagIndex['advanced']) && modelTagIndex['advanced'].length > 0) {
                return modelTagIndex['advanced'][0]
            }
         } else if (type === 'medium') {
            if (Array.isArray(modelTagIndex['medium']) && modelTagIndex['medium'].length > 0) {
                return modelTagIndex['medium'][0]
            } else if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } else if (Array.isArray(modelTagIndex['advanced']) && modelTagIndex['advanced'].length > 0) {
                return modelTagIndex['advanced'][0]
            }
         } else if (type === 'large') {
            if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } else if (Array.isArray(modelTagIndex['advanced']) && modelTagIndex['advanced'].length > 0) {
                return modelTagIndex['advanced'][0]
            }
         } else if (type === 'advanced') {
            if (Array.isArray(modelTagIndex['advanced']) && modelTagIndex['advanced'].length > 0) {
                return modelTagIndex['advanced'][0]
            } else if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } 
         } else if (type === 'code') {
            if (Array.isArray(modelTagIndex['code']) && modelTagIndex['code'].length > 0) {
                return modelTagIndex['code'][0]
            } else if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } else if (Array.isArray(modelTagIndex['advanced']) && modelTagIndex['advanced'].length > 0) {
                return modelTagIndex['advanced'][0]
            }
         } else if (type === 'instruct') {
            if (Array.isArray(modelTagIndex['instruct']) && modelTagIndex['instruct'].length > 0) {
                return modelTagIndex['instruct'][0]
            } else if (Array.isArray(modelTagIndex['large']) && modelTagIndex['large'].length > 0) {
                return modelTagIndex['large'][0]
            } 
         }
    }

    

    function getProviderUrl(provider) {
        switch (provider) {
            case 'openai':
                return 'https://api.openai.com/v1';
                break;
            case 'togetherai':
                return 'https://api.together.xyz/v1';
                break;
            case 'deepinfra':
                return 'https://api.deepinfra.com/v1/openai';
                break;
            case 'groqcloud':
                    return 'https://api.groq.com/openai/v1';
                    break;
            case 'selfhosted':
                return config && config.llm &&  config.llm.self_hosted_url ? config.llm.self_hosted_url : ''
                break;
            default:
                return '';
        }
    }

    function getModelUrl(provider) {
        console.log('GET MODEL URL',provider, config)
        if (provider === 'selfhosted' && config && config.llm && config.llm.self_hosted_url) {
            return config.llm.self_hosted_url
        } else if (provider === 'openai' && config && config.llm && config.llm.openai_key) {
            return getProviderUrl(provider)
        } else if (provider === 'groqcloud' && config && config.llm && config.llm.groqcloud_key) {
            return getProviderUrl(provider)
        } else if (hasCredit()) {
            return import.meta.env.VITE_API_URL
        }
    }

    function getModelApiKey(provider) {
        switch (provider) {
            case 'openai':
                return config && config.llm && config.llm.openai_key ? config.llm.openai_key : '' ;
                break;
            case 'togetherai':
                return config && config.llm && config.llm.togetherai_key ? config.llm.togetherai_key : '';
                break;
            case 'deepinfra':
                return config && config.llm && config.llm.deepinfra_key ? config.llm.deepinfra_key : '';
                break;
            case 'groqcloud':
                    return (config && config.llm && config.llm.groqcloud_key) ? config.llm.groqcloud_key : '';
                    break;
            case 'selfhosted':
                return config && config.llm &&  config.llm.self_hosted_key ? config.llm.self_hosted_key : ''
            default:
                return '';
        }
    }

    return { getModelKey, getModel, lookupModel, getModelUrl, getModelApiKey}
}


