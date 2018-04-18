function patch($dom, patches) {
    const index = {
        value: 0,
    }
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
};

export default patch;

{
    tagName: 
}