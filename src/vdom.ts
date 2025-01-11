type VNode = {
  tagName: string;
  props: Record<string, any>;
  children: (VNode | string)[];
};

export type Node = Text | (HTMLElement & { v: VNode });

export const createVNode = (tagName: string, props: Record<string, any> = {}, children: (VNode | string)[] = []) => {
  return {
    tagName,
    props,
    children
  };
};

export const createDOMNode = (vNode: VNode | string) => {
  if (typeof vNode === 'string') {
    return document.createTextNode(vNode);
  }

  const { tagName, props, children } = vNode;

  const node = document.createElement(tagName);

  patchProps(node as Node, {}, props);

  children.forEach((child) => {
    node.appendChild(createDOMNode(child));
  });

  return node;
};

export const pathNode = (node: Node, vNode: VNode | string, nextVNode: VNode | string) => {
  if (nextVNode === undefined) {
    node.remove();
  }

  if (typeof vNode === 'string' || typeof nextVNode === 'string') {
    if (vNode !== nextVNode) {
      const nextNode = createDOMNode(nextVNode);
      node.replaceWith(nextNode);
      return nextNode;
    }

    return node;
  }

  if (vNode.tagName !== nextVNode.tagName) {
    const nextNode = createDOMNode(nextVNode);
    node.replaceWith(nextNode);
    return nextNode;
  }

  patchProps(node, vNode.props, nextVNode.props);
  patchChildren(node, vNode.children, nextVNode.children);

  return node;
};

const patchProps = (node: Node, props: Record<string, any>, nextProps: Record<string, any>) => {
  const mergedProps = { ...props, ...nextProps };

  Object.keys(mergedProps).forEach((key) => {
    if (props[key] !== nextProps[key]) {
      if (nextProps[key] == null || nextProps[key] === false) {
        (node as HTMLElement).removeAttribute(key);
      } else {
        (node as HTMLElement).setAttribute(key, nextProps[key]);
      }
    }
  });
};

const patchChildren = (parent: Node, vChildren: (VNode | string)[], nextVChildren: (VNode | string)[]) => {
  parent.childNodes.forEach((childNode, i) => {
    pathNode(childNode as Node, vChildren[i], nextVChildren[i]);
  });

  nextVChildren.slice(vChildren.length).forEach((vChild) => {
    parent.appendChild(createDOMNode(vChild));
  });
};

export const patch = (nextVNode: VNode, node: Node) => {
  // @ts-ignore
  const vNode = node.v || recycleNode(node);

  node = pathNode(node, vNode, nextVNode) as Node;

  // @ts-ignore
  node.v = nextVNode;

  return node;
};

const TEXT_NODE_TYPE = 3;

const recycleNode = (node: Node): VNode | string => {
  if (node.nodeType === TEXT_NODE_TYPE) {
    return node.nodeValue || '';
  }

  const tagName = node.nodeName.toLowerCase();

  const children: (VNode | string)[] = Array.from(node.childNodes).map((child) => recycleNode(child as Node));

  return createVNode(tagName, {}, children);
};
