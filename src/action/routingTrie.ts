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

  private validateRoute(route: Route) {
    const { path } = route;

    // Check for unmatched braces
    const openBraces = (path.match(/\{/g) || []).length;
    const closeBraces = (path.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      throw new Error(`Unmatched braces in path: ${path}`);
    }

    // Check for empty parameter names
    if (path.includes('{}')) {
      throw new Error(`Empty parameter name in path: ${path}`);
    }

    // Check for nested braces
    if (path.includes('{{') || path.includes('}}')) {
      throw new Error(`Nested braces not allowed in path: ${path}`);
    }
  }

  insert(route: Route) {
    const { path } = route;

    this.validateRoute(route);

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
          while (i < path.length && path[i] !== '}') {
            keyBuilder.push(path[i]);
            i++;
          }

          const key = keyBuilder.join('');
          if (i >= path.length || path[i] !== '}') {
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
    const [pathWithoutQueryString, queryString] = path.split('?');
    let i = 0;
    if (this.root == null) return null;
    let currentNode = this.root;
    const requestPathBuilder = RequestPath.builder()
      .withPath(pathWithoutQueryString)
      .withQueryString(queryString);

    while (i < pathWithoutQueryString.length) {
      const char = pathWithoutQueryString[i];
      const { value, children, wildCardKey } = currentNode;

      if (value === '*') {
        // If value is * then we want to gobble update all the text in the request path a
        const paramBuilder: string[] = [];
        while (i < pathWithoutQueryString.length) {
          if (pathWithoutQueryString[i] === '/') break;
          paramBuilder.push(pathWithoutQueryString[i]);
          i++;
        }
        const param = paramBuilder.join('');
        if (!wildCardKey) throw TypeError('Url param key not defined');
        requestPathBuilder.withParam(wildCardKey, param);
      } else if (value !== char) {
        return null; // Invalid path
      }

      const nextIndex = currentNode.value === '*' ? i : i + 1;
      if (nextIndex >= pathWithoutQueryString.length) break;

      // Next character operation
      const nextChar = pathWithoutQueryString[nextIndex];
      const nextNode = children.find((node) =>
        ['*', nextChar].includes(node.value),
      );

      if (nextNode == null) return null;

      currentNode = nextNode;
      i = nextIndex;
    }

    if (currentNode.route == null) return null;

    return requestPathBuilder.withRoute(currentNode.route).build();
  }

  has(path: string): HasPathInfo {
    const requestPath = this.get(path);
    return {
      hasPath: requestPath != null,
      requestPath,
    };
  }
}

export type HasPathInfo = {
  hasPath: boolean;
  requestPath?: RequestPath | undefined | null;
};
