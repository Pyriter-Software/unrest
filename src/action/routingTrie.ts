import { Route } from '../model/route';
import { RequestPath } from '../handler/requestPath';

class Node {
  constructor(
    public value: string,
    public children: Node[],
    public route?: Route,
    public isWildCard: boolean = false,
    public wildCardKey?: string,
  ) {}
}

const generateRootNode = () => new Node('/', [], undefined);

export class RoutingTrie {
  public root?: Node;

  constructor(routes: Route[] = []) {
    routes.forEach((route) => this.insert(route));
  }

  insert(route: Route) {
    const { path } = route;

    if (path[0] !== '/') {
      throw new Error('Path must start with /');
    }

    if (!this.root) this.root = generateRootNode();
    if (path.length === 1) {
      this.root.route = route;
      return;
    }

    let i = 1;
    let currentNode = this.root;
    while (i < path.length) {
      const char = path[i];

      const { children } = currentNode;
      let nextNode = children.find((node) => node.value === char);

      if (nextNode == null) {
        // Add a new character
        // If the new character starts with a { , then we need to change that to a star
        if (char === '{') {
          // Get all the characters until '}' and store this string value to the arguments list
          i++;
          const keyBuilder: string[] = [];
          while (path[i] !== '}') {
            keyBuilder.push(path[i]);
            i++;
          }
          const char2 = path[i];

          const key = keyBuilder.join('');
          if (char2 !== '}') {
            throw new Error(
              `An opening brace '{' must end with a closing brace for ${key}`,
            );
          }

          nextNode = new Node('*', [], undefined, true, key);
          if (
            currentNode.children.filter((n) => n.value !== '*').length > 0
          )
            throw new Error(
              `Ambiguous path params. Trying to treat this position as a * but also found ${JSON.stringify(
                currentNode.children,
              )}`,
            );
          currentNode.children.push(nextNode);
        } else {
          nextNode = new Node(char, [], undefined);
          currentNode.children.push(nextNode);
        }
      }

      if (i + 1 >= path.length) {
        // At end of path
        nextNode.route = route;
      }

      currentNode = nextNode;
      i++;
    }
  }

  get(path: string): RequestPath | undefined | null {
    let i = 0;
    if (this.root == null) return null;
    let currentNode = this.root;
    const requestPathBuilder = RequestPath.builder().withPath(path);
    while (i < path.length) {
      const char = path[i];
      const { value, children } = currentNode;

      if (value === '*') {
        // If value is * then we want to gobble update all the text in the request path a
        const paramBuilder: string[] = [];
        while (i < path.length) {
          if (path[i] === '/') break;
          paramBuilder.push(path[i]);
          i++;
        }
        const param = paramBuilder.join('');
        requestPathBuilder.withParam(param);
      } else if (value !== char) {
        return null; // Invalid path
      }

      const nextIndex = i + 1;
      if (nextIndex >= path.length) break;

      // Next character operation
      const nextChar = path[nextIndex];
      const nextNode =
        children.find((node) => node.value === '*') ||
        children.find((node) => node.value === nextChar);

      if (nextNode == null) return null;

      currentNode = nextNode;
      i = nextIndex;
    }

    if (currentNode.route == null) return null;

    return requestPathBuilder.withRoute(currentNode.route).build();
  }

  has(path: string): boolean {
    return this.get(path) != null;
  }
}
