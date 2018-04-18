(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global['simple-virtual-dom'] = global['simple-virtual-dom'] || {}, global['simple-virtual-dom'].js = factory());
}(this, (function () { 'use strict';

    class Element {
        constructor(tagName, ...args) {
            this.tagName = tagName;
            // 判断下面还有没有子元素
            if(Array.isArray(args[0])) {
                this.props = {};
                this.children = args[0];
            } else {
                this.props = args[0];
                this.children = args[1];
            }
            this.key = this.props.key || void 0;
        }
        render() {
            // 创建一个元素
            const $dom = document.createElement(this.tagName);
            // 给元素加上所有的属性
            for(const proKey in this.props) {
                $dom.setAttribute(proKey, this.props[proKey]);
            }
            // 如果存在子节点
            if(this.children) {
                this.children.forEach(child => {
                    // 如果子元素还包含子元素,则递归
                    if(child instanceof Element) {
                        $dom.appendChild(child.render());
                    } else {
                        $dom.appendChild(document.createTextNode(child));
                    }
                });
            }
            return $dom;
        }
    }

    function patch($dom, patches) {
        const index = {
            value: 0,
        };
        dfsWalk($dom, index, patches);
    }
    patch.NODE_DELETE = 'NODE_DELETE'; // 节点被删除
    patch.NODE_TEXT_MODIFY = 'NODE_TEXT_MODIFY'; // 文本节点被更改
    patch.NODE_REPLACE = 'NODE_REPLACE'; // 节点被替代
    patch.NODE_ADD = 'NODE_ADD'; // 添加节点
    patch.NODE_ATTRIBUTE_MODIFY = 'NODE_ATTRIBUTE_MODIFY'; // 更新属性
    patch.NODE_ATTRIBUTE_ADD = 'NODE_ATTRIBUTE_ADD'; // 添加属性
    patch.NODE_ATTRIBUTE_DELETE = 'NODE_ATTRIBUTE_DELETE'; // 删除属性

    function dfsWalk($node, index, patches, isEnd = false) {
        if (patches[index.value]) {
            patches[index.value].forEach(p => {
                switch (p.type) {
                    case patch.NODE_ATTRIBUTE_MODIFY:
                        {
                            $node.setAttribute(p.key, p.value);
                            break;
                        }
                    case patch.NODE_ATTRIBUTE_DELETE:
                        {
                            $node.removeAttribute(p.key, p.value);
                            break;
                        }
                    case patch.NODE_ATTRIBUTE_ADD:
                        {
                            $node.setAttribute(p.key, p.value);
                            break;
                        }
                    case patch.NODE_ADD:
                        {
                            $node.appendChild(p.value.render());
                            break;
                        }
                    case patch.NODE_TEXT_MODIFY:
                        {
                            $node.textContent = p.value;
                            break;
                        }
                    case patch.NODE_REPLACE:
                        {
                            $node.replaceWith(p.value.render());
                            break;
                        }
                    case patch.NODE_DELETE:
                        {
                            $node.remove();
                            break;
                        }
                    default:
                        {
                            console.log(p);
                        }

                }

            });
        }
        if (isEnd) {
            return;
        }
        if ($node.children.length > 0) {
            for (let i = 0; i < $node.children.length; i++) {
                index.value++;
                dfsWalk($node.children[i], index, patches);
            }
        } else {
            index.value++;
            dfsWalk($node, index, patches, true);
        }
    }

    function diff(oldTree, newTree) {
        const patches = {};
        const index = {
            value: 0,
        };
        dfsWalk$1(oldTree, newTree, index, patches);
        return patches;
    }
    // 比较属性的变化
    function diffProps(oldProps, newProps, index, currentIndexPatches) {
        // 遍历旧的属性,找到被删除和修改的情况
        for (const propKey in oldProps) {
            // 新属性中不存在,旧属性存在,属性被删除
            if (!newProps.hasOwnProperty(propKey)) {
                currentIndexPatches.push({
                    type: patch.NODE_ATTRIBUTE_DELETE,
                    key: propKey,
                });
            } else if (newProps[propKey] !== oldProps[propKey]) {
                // 新旧属性中都存在,但是值不同: 属性被修改
                currentIndexPatches.push({
                    type: patch.NODE_ATTRIBUTE_MODIFY,
                    key: propKey,
                    alue: newProps[propKey],
                });
            }
        }

        // 遍历新元素,找到添加的部分
        for (const propKey in newProps) {
            // 旧属性中不存在,新属性中存在: 添加属性
            if (!oldProps.hasOwnProperty(propKey)) {
                currentIndexPatches.push({
                    type: patch.NODE_ATTRIBUTE_ADD,
                    key: propKey,
                    value: newProps[propKey]
                });
            }
        }
    }
    // 比较子元素的变化
    function diffChildren(oldChildren, newChildren, index, currentIndexPatches, patches) {
        const currentIndex = index.value;
        if (oldChildren.length < newChildren.length) {
            let i = 0;
            for (; i < oldChildren.length; i++) {
                index.value++;
                dfsWalk$1(oldChildren[i], newChildren[i], index, patches);
            }
            for (; i < newChildren.length; i++) {
                currentIndexPatches.push({
                    type: patch.NODE_ADD,
                    value: newChildren[i]
                });
            }
        } else {
            for(let i = 0; i< oldChildren.length; i++) {
                index.value++;
                dfsWalk$1(oldChildren[i], newChildren[i], index, patches);
            }
        }
    }
    // 比较innerHTML的变化
    function dfsWalk$1(oldNode, newNode, index, patches) {
        const currentIndex = index.value;
        const currentIndexPatches = [];
        if(newNode === undefined) {
            currentIndexPatches.push({
                type: patch.NODE_DELETE,
            });
        } else if(typeof oldNode === 'string' && typeof newNode === 'string') {
            if(oldNode !== newNode) {
                currentIndexPatches.push({
                    type: patch.NODE_TEXT_MODIFY,
                    value: newNode,
                });
            }
        } else if(oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
            diffProps(oldNode.props, newNode.props, index, currentIndexPatches);
            diffChildren(oldNode.children, newNode.children, index, currentIndexPatches, patches);
        } else {
            currentIndexPatches.push({
                type: patch.NODE_REPLACE,
                value: newNode,
            });
        }
        if(currentIndexPatches.length > 0) {
            patches[currentIndex] = currentIndexPatches;
        }
    }

    const MyVdom = {
        Element,
        diff,
        patch
    };
    window.MyVdom = MyVdom;

    return MyVdom;

})));
