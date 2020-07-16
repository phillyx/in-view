import Registry from './registry';
import { inViewport } from './viewport';
import { throttle } from 'lodash';
import { isNative } from './utils'
/**
* Create and return the inView function.
*/
const inView = () => {

    /**
    * Fallback if window is undefined.
    */
    if (typeof window === 'undefined') return;

    /**
    * How often and on what events we should check
    * each registry.
    */
    const interval = 100;
    const triggers = ['scroll', 'resize', 'load'];
    const POSITIONS = ['top', 'right', 'bottom', 'left'];
    /**
    * Maintain a hashmap of all registries, a history
    * of selectors to enumerate, and an options object.
    */
    let selectors = { history: [] };
    let options   = { offset: {}, threshold: 0, test: inViewport };

    /**
    * Check each registry from selector history,
    * throttled to interval.
    */
    const check = throttle(() => {
        selectors.history.forEach(selector => {
            selectors[selector].check();
        });
    }, interval);

    let setIntersectionObserver = null;
    if (typeof IntersectionObserver !== 'undefined' && isNative(IntersectionObserver)) {
        let observer = null
         setIntersectionObserver = () => {
            // define after `options` set
            !observer &&
                (observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                var target = entry.target
                                const sel = selectors.history.find(sel => selectors[sel].elements.find(el => el === target))
                                // If intersectionRatio is 0, the target is out of view
                                if (entry.intersectionRatio <= 0) {
                                    selectors[sel].check(target, false)
                                    return
                                }
                                selectors[sel].check(target)
                            }
                        })
                  },
                  {
                    rootMargin: POSITIONS.map(p => (-options.offset[p] || 0) + 'px') // root-margin settings  is the opposite of  `control.offset()`
                      .join(' '),
                    threshold: options.threshold || 0,
                  }
                ));

            selectors.history.forEach(selector => {
                selectors[selector].elements.forEach(x => {
                    observer.observe(x)
                })
            })
         }
    } else {
    
        /**
        * For each trigger event on window, add a listener
        * which checks each registry.
        */
        triggers.forEach(event =>
            addEventListener(event, check));

        /**
        * If supported, use MutationObserver to watch the
        * DOM and run checks on mutation.
        */
        if (window.MutationObserver) {
            addEventListener('DOMContentLoaded', () => {
                new MutationObserver(check)
                    .observe(document.body, { attributes: true, childList: true, subtree: true });
            });
        }
    }
    /**
    * The main interface. Take a selector and retrieve
    * the associated registry or create a new one.
    */
    let control = (selector) => {

        if (typeof selector !== 'string') return;

        // Get an up-to-date list of elements.
        let elements = [].slice.call(document.querySelectorAll(selector));

        // If the registry exists, update the elements.
        if (selectors.history.indexOf(selector) > -1) {
            selectors[selector].elements = elements;
        }

        // If it doesn't exist, create a new registry.
        else {
            selectors[selector] = Registry(elements, options);
            selectors.history.push(selector);
        }
        setIntersectionObserver && setIntersectionObserver()
        return selectors[selector];
    };

    /**
    * Mutate the offset object with either an object
    * or a number.
    */
    control.offset = o => {
        if (o === undefined) return options.offset;
        const isNum = n => typeof n === 'number';
        POSITIONS.forEach(isNum(o) ?
            dim => options.offset[dim] = o :
            dim => isNum(o[dim]) ? options.offset[dim] = o[dim] : null
        );
        return options.offset;
    };

    /**
    * Set the threshold with a number.
    */
    control.threshold = n => {
        return typeof n === 'number' && n >= 0 && n <= 1
            ? options.threshold = n
            : options.threshold;
    };

    /**
    * Use a custom test, overriding inViewport, to
    * determine element visibility.
    */
    control.test = fn => {
        return typeof fn === 'function'
            ? options.test = fn
            : options.test;
    };

    /**
    * Add proxy for test function, set defaults,
    * and return the interface.
    */
    control.is = el => options.test(el, options);
    control.offset(0);
    return control;

};

// Export a singleton.
export default inView();
