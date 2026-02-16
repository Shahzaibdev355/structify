const PROJECT_PREFIX = 'roomify_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
};


const getUserId = async (userPuter) => {
    try {

        const user = await userPuter.auth.getUser();

        return user?.uuid || null;

    } catch (error) {
        return null
    }
}


router.post('/api/projects/save', async ({ request, user }) => {
    try {

        const userPuter = user.puter;

        if (!userPuter) return jsonError(401, 'Auth failed')

        const body = await request.json();
        const project = body?.project;

        if (!project.id || !project?.sourceImage) return jsonError(400, 'Project id and source image both are required')

        const payLoad = {
            ...project,
            updatedAt: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Auth Failed')

        const key = `${PROJECT_PREFIX}${project.id}`
        await userPuter.kv.set(key, payLoad);

        return { saved: true, id: project.id, project: payLoad }


    } catch (error) {
        return jsonError(500, 'failed to save project', { message: error.message || 'unknown error' })
    }
})


router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Auth failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Auth failed');

        // Get all keys from KV
        const keys = await userPuter.kv.list();

        // Filter project keys
        const projectKeys = keys.filter(key =>
            key.startsWith(PROJECT_PREFIX)
        );

        // Fetch all projects
        const projects = await Promise.all(
            projectKeys.map(key => userPuter.kv.get(key))
        );

        return new Response(JSON.stringify({ projects }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return jsonError(500, 'Failed to list projects', {
            message: error?.message || 'Unknown error'
        });
    }
});


router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Auth failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Auth failed');

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return jsonError(400, 'Project id is required');

        const key = `${PROJECT_PREFIX}${id}`;

        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return new Response(JSON.stringify({ project }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return jsonError(500, 'Failed to get project', {
            message: error?.message || 'Unknown error'
        });
    }
});

router.post('/api/projects/update-visibility', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Auth failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Auth failed');

        const body = await request.json();
        const { id, visibility } = body;

        if (!id) return jsonError(400, 'Project id is required');
        if (!visibility || !['private', 'public'].includes(visibility)) {
            return jsonError(400, 'Valid visibility (private/public) is required');
        }

        const key = `${PROJECT_PREFIX}${id}`;

        // Get existing project
        const existingProject = await userPuter.kv.get(key);
        if (!existingProject) return jsonError(404, 'Project not found');

        // Update project with new visibility
        const updatedProject = {
            ...existingProject,
            isPublic: visibility === 'public',
            updatedAt: new Date().toISOString(),
        };

        // Save updated project
        await userPuter.kv.set(key, updatedProject);

        return new Response(JSON.stringify({ project: updatedProject }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return jsonError(500, 'Failed to update project visibility', {
            message: error?.message || 'Unknown error'
        });
    }
});
