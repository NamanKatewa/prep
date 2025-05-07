// Graph Utilities
function buildAdjMatrix(edges, nodeCount) {
  const adj = Array.from({ length: nodeCount }, () =>
    Array(nodeCount).fill(Infinity)
  );
  for (const { from, to, weight = 1, status = 0 } of edges) {
    if (status === 0) {
      adj[from][to] = weight;
      adj[to][from] = weight;
    }
  }
  return adj;
}

// -------- DFS --------
export function dfsPath(edges, nodeCount, start, end) {
  const adj = buildAdjMatrix(edges, nodeCount);
  const visited = new Array(nodeCount).fill(false);
  const path = [];

  function dfs(u) {
    if (u === end) {
      path.push(u);
      return true;
    }
    visited[u] = true;
    path.push(u);

    for (let v = 0; v < nodeCount; v++) {
      if (!visited[v] && adj[u][v] < Infinity) {
        if (dfs(v)) return true;
      }
    }
    path.pop();
    return false;
  }

  dfs(start);
  return path;
}

// -------- BFS --------
export function bfsPath(edges, nodeCount, start, end) {
  const adj = buildAdjMatrix(edges, nodeCount);
  const visited = new Array(nodeCount).fill(false);
  const prev = new Array(nodeCount).fill(-1);
  const queue = [start];
  visited[start] = true;

  while (queue.length > 0) {
    const u = queue.shift();
    if (u === end) break;

    for (let v = 0; v < nodeCount; v++) {
      if (!visited[v] && adj[u][v] < Infinity) {
        visited[v] = true;
        prev[v] = u;
        queue.push(v);
      }
    }
  }

  const path = [];
  for (let at = end; at !== -1; at = prev[at]) path.push(at);
  return path.reverse();
}

// -------- Dijkstra --------
export function dijkstraPath(edges, nodeCount, start, end) {
  const adj = buildAdjMatrix(edges, nodeCount);
  const dist = Array(nodeCount).fill(Infinity);
  const prev = Array(nodeCount).fill(-1);
  const visited = Array(nodeCount).fill(false);

  dist[start] = 0;

  for (let i = 0; i < nodeCount; i++) {
    let u = -1;
    for (let j = 0; j < nodeCount; j++) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;
    }
    if (dist[u] === Infinity) break;

    visited[u] = true;
    for (let v = 0; v < nodeCount; v++) {
      if (adj[u][v] < Infinity && dist[u] + adj[u][v] < dist[v]) {
        dist[v] = dist[u] + adj[u][v];
        prev[v] = u;
      }
    }
  }

  const path = [];
  for (let at = end; at !== -1; at = prev[at]) path.push(at);
  return path.reverse();
}

// -------- A* --------
export function astarPath(edges, nodeCount, start, end, positions) {
  const adj = buildAdjMatrix(edges, nodeCount);

  const heuristic = (a, b) => {
    const dx = positions[a].x - positions[b].x;
    const dy = positions[a].y - positions[b].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const gScore = Array(nodeCount).fill(Infinity);
  const fScore = Array(nodeCount).fill(Infinity);
  const cameFrom = Array(nodeCount).fill(-1);
  const openSet = new Set([start]);

  gScore[start] = 0;
  fScore[start] = heuristic(start, end);

  while (openSet.size) {
    let current = [...openSet].reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );

    if (current === end) break;

    openSet.delete(current);

    for (let neighbor = 0; neighbor < nodeCount; neighbor++) {
      if (adj[current][neighbor] < Infinity) {
        const tentativeG = gScore[current] + adj[current][neighbor];
        if (tentativeG < gScore[neighbor]) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentativeG;
          fScore[neighbor] = tentativeG + heuristic(neighbor, end);
          openSet.add(neighbor);
        }
      }
    }
  }

  const path = [];
  for (let at = end; at !== -1; at = cameFrom[at]) path.push(at);
  return path.reverse();
}
