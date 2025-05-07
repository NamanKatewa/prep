#include <stdlib.h>
#include <limits.h>
#include <stdbool.h>
#include <math.h>

typedef struct
{
    int from;
    int to;
    int weight;
    int status;
} Edge;

typedef struct
{
    float x;
    float y;
} Position;

static Position *node_positions = NULL;
static int node_positions_count = 0;

#define MAX_NODES 100

int adj[MAX_NODES][MAX_NODES];

void build_graph(Edge *edges, int edge_count, int node_count, float *positions)
{
    for (int i = 0; i < node_count; i++)
    {
        for (int j = 0; j < node_count; j++)
        {
            adj[i][j] = INT_MAX / 2;
        }
    }

    for (int i = 0; i < edge_count; i++)
    {
        if (edges[i].status == 0)
        {
            adj[edges[i].from][edges[i].to] = edges[i].weight;
            adj[edges[i].to][edges[i].from] = edges[i].weight;
        }
    }

    if (node_positions)
        free(node_positions);

    node_positions = malloc(sizeof(Position) * node_count);
    for (int i = 0; i < node_count; i++)
    {
        node_positions[i].x = positions[i * 2];
        node_positions[i].y = positions[i * 2 + 1];
    }

    node_positions_count = node_count;
}

// ---------------- DFS ----------------

bool dfs_util(int current, int target, bool *visited, int *path, int *index, int node_count)
{
    visited[current] = true;
    path[(*index)++] = current;

    if (current == target)
        return true;

    for (int neighbor = 0; neighbor < node_count; neighbor++)
    {
        if (adj[current][neighbor] < INT_MAX / 2 && !visited[neighbor])
        {
            if (dfs_util(neighbor, target, visited, path, index, node_count))
                return true;
        }
    }

    (*index)--;
    return false;
}

int *dfs_path(Edge *edges, int edge_count, int node_count, int start, int end, int *path_length, float *positions)
{
    build_graph(edges, edge_count, node_count, positions);

    bool visited[MAX_NODES] = {0};
    int *path = malloc(MAX_NODES * sizeof(int));
    int index = 0;

    dfs_util(start, end, visited, path, &index, node_count);

    *path_length = index;
    return path;
}

// ---------------- BFS ----------------

typedef struct
{
    int items[MAX_NODES];
    int front, rear;
} Queue;

void enqueue(Queue *q, int value)
{
    q->items[++q->rear] = value;
}

int dequeue(Queue *q)
{
    return q->items[q->front++];
}

bool isEmpty(Queue *q)
{
    return q->front > q->rear;
}

int *bfs_path(Edge *edges, int edge_count, int node_count, int start, int end, int *path_length, float *positions)
{
    build_graph(edges, edge_count, node_count, positions);

    bool visited[MAX_NODES] = {0};
    int prev[MAX_NODES];
    for (int i = 0; i < node_count; i++)
        prev[i] = -1;

    Queue q = {.front = 0, .rear = -1};
    enqueue(&q, start);
    visited[start] = true;

    while (!isEmpty(&q))
    {
        int node = dequeue(&q);

        if (node == end)
            break;

        for (int neighbor = 0; neighbor < node_count; neighbor++)
        {
            if (adj[node][neighbor] < INT_MAX / 2 && !visited[neighbor])
            {
                enqueue(&q, neighbor);
                visited[neighbor] = true;
                prev[neighbor] = node;
            }
        }
    }

    int temp_path[MAX_NODES];
    int temp_index = 0;
    for (int at = end; at != -1; at = prev[at])
        temp_path[temp_index++] = at;

    int *path = malloc(temp_index * sizeof(int));
    for (int i = 0; i < temp_index; i++)
        path[i] = temp_path[temp_index - i - 1];

    *path_length = temp_index;
    return path;
}

// ---------------- Dijkstra ----------------

int *dijkstra_path(Edge *edges, int edge_count, int node_count, int start, int end, int *path_length, float *positions)
{
    build_graph(edges, edge_count, node_count, positions);

    int dist[MAX_NODES];
    int prev[MAX_NODES];
    bool visited[MAX_NODES] = {0};

    for (int i = 0; i < node_count; i++)
    {
        dist[i] = INT_MAX / 2;
        prev[i] = -1;
    }

    dist[start] = 0;

    for (int i = 0; i < node_count; i++)
    {
        int u = -1;
        for (int j = 0; j < node_count; j++)
        {
            if (!visited[j] && (u == -1 || dist[j] < dist[u]))
                u = j;
        }

        if (u == -1 || dist[u] == INT_MAX / 2)
            break;

        visited[u] = true;

        for (int v = 0; v < node_count; v++)
        {
            if (dist[u] + adj[u][v] < dist[v])
            {
                dist[v] = dist[u] + adj[u][v];
                prev[v] = u;
            }
        }
    }

    int temp_path[MAX_NODES];
    int temp_index = 0;
    for (int at = end; at != -1; at = prev[at])
        temp_path[temp_index++] = at;

    int *path = malloc(temp_index * sizeof(int));
    for (int i = 0; i < temp_index; i++)
        path[i] = temp_path[temp_index - i - 1];

    *path_length = temp_index;
    return path;
}

// ---------------- A* ----------------

float heuristic(int a, int b)
{
    float ax = node_positions[a].x;
    float ay = node_positions[a].y;
    float bx = node_positions[b].x;
    float by = node_positions[b].y;
    return sqrtf((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
}

int *astar_path(Edge *edges, int edge_count, int node_count, int start, int end, int *path_length, float *positions)
{
    build_graph(edges, edge_count, node_count, positions);

    int came_from[MAX_NODES];
    float g_score[MAX_NODES];
    float f_score[MAX_NODES];
    bool open_set[MAX_NODES] = {0};

    for (int i = 0; i < node_count; i++)
    {
        g_score[i] = 1e9;
        f_score[i] = 1e9;
        came_from[i] = -1;
    }

    g_score[start] = 0;
    f_score[start] = heuristic(start, end);
    open_set[start] = true;

    for (int iter = 0; iter < node_count; iter++)
    {
        int current = -1;
        for (int i = 0; i < node_count; i++)
        {
            if (open_set[i] && (current == -1 || f_score[i] < f_score[current]))
                current = i;
        }

        if (current == -1)
            break;

        if (current == end)
            break;

        open_set[current] = false;

        for (int neighbor = 0; neighbor < node_count; neighbor++)
        {
            if (adj[current][neighbor] < INT_MAX / 2)
            {
                float tentative_g = g_score[current] + adj[current][neighbor];
                if (tentative_g < g_score[neighbor])
                {
                    came_from[neighbor] = current;
                    g_score[neighbor] = tentative_g;
                    f_score[neighbor] = g_score[neighbor] + heuristic(neighbor, end);
                    open_set[neighbor] = true;
                }
            }
        }
    }

    int temp_path[MAX_NODES];
    int temp_index = 0;
    for (int at = end; at != -1; at = came_from[at])
        temp_path[temp_index++] = at;

    int *path = malloc(temp_index * sizeof(int));
    for (int i = 0; i < temp_index; i++)
        path[i] = temp_path[temp_index - i - 1];

    *path_length = temp_index;
    return path;
}
