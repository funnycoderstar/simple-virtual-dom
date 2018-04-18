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
                    $dom.appendChild(document.createTextNode(child))
                }
            });
        }
        return $dom;
    }
};
export default Element;