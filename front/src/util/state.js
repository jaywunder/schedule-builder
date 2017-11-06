export function unsubscribe(that) {
  Object.keys(that)
    .filter(fnName => fnName.startsWith('unsubscribe'))
    .map(fnName => that[fnName]())
}

export function subscribe(that) {
  const fn = function(...attrs) {
    const store = this.context.store

    if (attrs.length === 2 && typeof attrs[1] === 'function') {
      return store.subscribe(() => {
        const state = store.getState()
        const [attr, cb] = attrs

        if (state[attr] && state[attr] !== this.state[attr])
          this.setState({ [attr]: state[attr] }, cb)
      })

    } else {
      // list of attributes
      return store.subscribe(() => {
        const state = store.getState()

        for (let attr of attrs)
          if (state[attr] && state[attr] !== this.state[attr])
            this.setState({ [attr]: state[attr] })
      })
    }
  }
  return fn.bind(that)
}
