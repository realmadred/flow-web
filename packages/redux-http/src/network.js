import { Axios } from 'axios'
import defaults from 'axios/lib/defaults'

function isString (v) {
  return typeof v === 'string'
}

function isFunction (v) {
  return typeof v === 'function'
}

function getConfig (url, config) {
  // merge in config, not immutable
  const conf = isString(url) ? { ...(config || {}), url } : url
  return conf
}

function buildURL (url, params = {}) {
  const r = /:([a-zA-Z]\w*)/g
  const match = url.match(r)
  match && match.forEach((i) => {
    const m = i.substr(1)
    const v = params[m]
    if (v === undefined) {
      throw new Error(`unfind url params, ${url}`)
    }
    url = url.replace(i, v)
    params[m] = undefined
  })
  return url
}

export default class HttpProvider extends Axios {
  request (url, config) {
    const conf = getConfig(url, config)
    conf.url = buildURL(conf.url, conf.params)
    if (conf.params && ['post', 'put', 'patch'].includes(conf.method)) {
      conf.data = { ...conf.data, ...conf.params }
      conf.params = undefined
    }
    const { transformResponse, transformRequest } = conf
    if (transformResponse && isFunction(transformResponse)) {
      conf.transformResponse = [
        ...defaults.transformResponse,
        transformResponse
      ]
    }
    if (transformRequest && isFunction(transformRequest)) {
      conf.transformRequest = [
        ...defaults.transformRequest,
        transformRequest
      ]
    }
    return super.request(conf)
  }

  $get () {
    return this.request.bind(this)
  }
}
