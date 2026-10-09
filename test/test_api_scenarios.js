// Automated Test Suite for University Research Opportunity Portal API
// Tests all 8 scenarios mandated by CN Assignment #01 using live HTTP requests

const http = require('http');
const express = require('express');

// Create an in-memory database engine matching MySQL research_opportunities table behavior
class MockDatabase {
    constructor() {
        this.records = [];
        this.autoId = 1;
    }

    async execute(query, params = []) {
        const normalized = query.trim().toUpperCase();

        if (normalized.startsWith('INSERT INTO RESEARCH_OPPORTUNITIES')) {
            const [
                title, description, research_area, faculty_name, department,
                required_skills, available_positions, application_deadline, status
            ] = params;

            const newRecord = {
                id: this.autoId++,
                title,
                description,
                research_area,
                faculty_name,
                department,
                required_skills,
                available_positions,
                application_deadline,
                status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            this.records.push(newRecord);
            return [{ insertId: newRecord.id, affectedRows: 1 }, null];
        }

        if (normalized.startsWith('SELECT * FROM RESEARCH_OPPORTUNITIES WHERE ID = ?')) {
            const id = parseInt(params[0], 10);
            const found = this.records.filter(r => r.id === id);
            return [found, null];
        }

        if (normalized.startsWith('SELECT ID FROM RESEARCH_OPPORTUNITIES WHERE ID = ?')) {
            const id = parseInt(params[0], 10);
            const found = this.records.filter(r => r.id === id).map(r => ({ id: r.id }));
            return [found, null];
        }

        if (normalized.startsWith('SELECT * FROM RESEARCH_OPPORTUNITIES ORDER BY CREATED_AT DESC')) {
            const sorted = [...this.records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return [sorted, null];
        }

        if (normalized.startsWith('UPDATE RESEARCH_OPPORTUNITIES')) {
            const [
                title, description, research_area, faculty_name, department,
                required_skills, available_positions, application_deadline, status, idParam
            ] = params;

            const id = parseInt(idParam, 10);
            const idx = this.records.findIndex(r => r.id === id);
            if (idx === -1) {
                return [{ affectedRows: 0 }, null];
            }

            this.records[idx] = {
                ...this.records[idx],
                title,
                description,
                research_area,
                faculty_name,
                department,
                required_skills,
                available_positions,
                application_deadline,
                status,
                updated_at: new Date().toISOString()
            };

            return [{ affectedRows: 1 }, null];
        }

        if (normalized.startsWith('DELETE FROM RESEARCH_OPPORTUNITIES WHERE ID = ?')) {
            const id = parseInt(params[0], 10);
            const initialLen = this.records.length;
            this.records = this.records.filter(r => r.id !== id);
            const affectedRows = initialLen - this.records.length;
            return [{ affectedRows }, null];
        }

        throw new Error('Unsupported test query: ' + query);
    }
}

// Proxy db module with MockDatabase
const mockDb = new MockDatabase();
require.cache[require.resolve('../backend/config/db')] = {
    exports: mockDb
};

const app = express();
app.use(express.json());
const opportunityRoutes = require('../backend/routes/opportunityRoutes');
app.use('/api/opportunities', opportunityRoutes);

// Helper to make real HTTP requests to the running server
function httpRequest(serverUrl, method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, serverUrl);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

// Run the full test suite
async function runTests() {
    // Start HTTP server on arbitrary open port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    console.log('=================================================================');
    console.log(`🧪 RUNNING BACKEND REST API TEST SUITE (Port: ${port})`);
    console.log('=================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, details = '') {
        if (condition) {
            console.log(`  ✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${testName} - Details: ${details}`);
            failed++;
        }
    }

    try {
        // -----------------------------------------------------------------
        // Scenario 1: Create at least 3 research opportunities
        // -----------------------------------------------------------------
        console.log('📋 Scenario 1: Creating 3 Research Opportunities (POST)');
        const opp1 = {
            title: 'Quantum Machine Learning Algorithms',
            description: 'Developing variational quantum circuits for classification benchmarks.',
            research_area: 'Quantum Computing & AI',
            faculty_name: 'Dr. Zeeshan Ali',
            department: 'Computer Science',
            required_skills: 'Python, Qiskit, Linear Algebra',
            available_positions: 2,
            application_deadline: '2026-11-20',
            status: 'Open'
        };
        const res1 = await httpRequest(baseUrl, 'POST', '/api/opportunities', opp1);
        assert(res1.status === 201 && res1.body.data.id === 1 && res1.body.data.status === 'Open',
            'Create Opportunity #1 (201 Created)', JSON.stringify(res1.body));

        const opp2 = {
            title: '5G Core Network Slicing & Security',
            description: 'Evaluating resource allocation algorithms under DDoS attack traffic in 5G cores.',
            research_area: 'Network Security & 5G',
            faculty_name: 'Dr. Hamna Rizvi',
            department: 'Telecommunication Engineering',
            required_skills: 'Open5GS, Wireshark, Linux, Docker',
            available_positions: 3,
            application_deadline: '2026-12-05',
            status: 'Open'
        };
        const res2 = await httpRequest(baseUrl, 'POST', '/api/opportunities', opp2);
        assert(res2.status === 201 && res2.body.data.id === 2,
            'Create Opportunity #2 (201 Created)', JSON.stringify(res2.body));

        const opp3 = {
            title: 'Bio-Signal Processing for Wearable Sensors',
            description: 'Real-time noise filtering on ECG/EEG streams using embedded DSP microcontrollers.',
            research_area: 'Biomedical & Embedded Systems',
            faculty_name: 'Dr. Usman Farooq',
            department: 'Electrical Engineering',
            required_skills: 'C, MATLAB, Signal Processing',
            available_positions: 1,
            application_deadline: '2026-11-10',
            status: 'Open'
        };
        const res3 = await httpRequest(baseUrl, 'POST', '/api/opportunities', opp3);
        assert(res3.status === 201 && res3.body.data.id === 3,
            'Create Opportunity #3 (201 Created)', JSON.stringify(res3.body));

        // -----------------------------------------------------------------
        // Scenario 2: Retrieve all opportunities
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 2: Retrieve All Research Opportunities (GET)');
        const resGetAll = await httpRequest(baseUrl, 'GET', '/api/opportunities');
        assert(resGetAll.status === 200 && resGetAll.body.count === 3 && Array.isArray(resGetAll.body.data),
            'Retrieve All Opportunities (200 OK, count: 3)', JSON.stringify(resGetAll.body));

        // -----------------------------------------------------------------
        // Scenario 3: Retrieve one opportunity by ID
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 3: Retrieve One Opportunity by ID (GET)');
        const resGetOne = await httpRequest(baseUrl, 'GET', '/api/opportunities/2');
        assert(resGetOne.status === 200 && resGetOne.body.data.id === 2 && resGetOne.body.data.faculty_name === 'Dr. Hamna Rizvi',
            'Retrieve Opportunity ID 2 (200 OK)', JSON.stringify(resGetOne.body));

        // -----------------------------------------------------------------
        // Scenario 4: Update an opportunity
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 4: Update an Opportunity (PUT)');
        const updatePayload = {
            title: '5G Core Network Slicing & AI-Assisted Security',
            available_positions: 4,
            required_skills: 'Open5GS, Wireshark, Linux, Docker, PyTorch'
        };
        const resUpdate = await httpRequest(baseUrl, 'PUT', '/api/opportunities/2', updatePayload);
        assert(resUpdate.status === 200 && resUpdate.body.data.available_positions === 4 && resUpdate.body.data.title === updatePayload.title,
            'Update Opportunity ID 2 (200 OK)', JSON.stringify(resUpdate.body));

        // -----------------------------------------------------------------
        // Scenario 5: Change opportunity status from Open to Closed
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 5: Change Status from Open to Closed (PUT)');
        const resClose = await httpRequest(baseUrl, 'PUT', '/api/opportunities/2', { status: 'Closed' });
        assert(resClose.status === 200 && resClose.body.data.status === 'Closed',
            'Change Status to Closed (200 OK)', JSON.stringify(resClose.body));

        // -----------------------------------------------------------------
        // Scenario 6: Delete an opportunity
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 6: Delete an Opportunity (DELETE)');
        const resDelete = await httpRequest(baseUrl, 'DELETE', '/api/opportunities/3');
        assert(resDelete.status === 200 && resDelete.body.success === true,
            'Delete Opportunity ID 3 (200 OK)', JSON.stringify(resDelete.body));

        // -----------------------------------------------------------------
        // Scenario 7: Request deleted opportunity to confirm 404 Not Found
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 7: Verify 404 Not Found Handling');
        const resGetDeleted = await httpRequest(baseUrl, 'GET', '/api/opportunities/3');
        assert(resGetDeleted.status === 404 && resGetDeleted.body.success === false,
            'GET Deleted Opportunity returns 404 Not Found', JSON.stringify(resGetDeleted.body));

        const resDeleteNonExistent = await httpRequest(baseUrl, 'DELETE', '/api/opportunities/999');
        assert(resDeleteNonExistent.status === 404 && resDeleteNonExistent.body.success === false,
            'DELETE Non-Existent ID returns 404 Not Found', JSON.stringify(resDeleteNonExistent.body));

        const resPutNonExistent = await httpRequest(baseUrl, 'PUT', '/api/opportunities/999', { status: 'Closed' });
        assert(resPutNonExistent.status === 404 && resPutNonExistent.body.success === false,
            'PUT Non-Existent ID returns 404 Not Found', JSON.stringify(resPutNonExistent.body));

        // -----------------------------------------------------------------
        // Scenario 8: Validation and Error Handling (Verify 400 Bad Request)
        // -----------------------------------------------------------------
        console.log('\n📋 Scenario 8: Input Validation & Error Cases (400 Bad Request)');
        // 8a: Missing required fields
        const resMissing = await httpRequest(baseUrl, 'POST', '/api/opportunities', { title: 'Incomplete Opportunity' });
        assert(resMissing.status === 400 && resMissing.body.message.includes('Missing required fields'),
            'POST Missing Fields returns 400 Bad Request', JSON.stringify(resMissing.body));

        // 8b: Negative positions
        const resNegPositions = await httpRequest(baseUrl, 'POST', '/api/opportunities', {
            ...opp1,
            available_positions: -5
        });
        assert(resNegPositions.status === 400 && resNegPositions.body.message.includes('non-negative integer'),
            'POST Negative Positions returns 400 Bad Request', JSON.stringify(resNegPositions.body));

        // 8c: Invalid status
        const resInvalidStatus = await httpRequest(baseUrl, 'POST', '/api/opportunities', {
            ...opp1,
            status: 'PendingReview'
        });
        assert(resInvalidStatus.status === 400 && resInvalidStatus.body.message.includes("'Open' or 'Closed'"),
            'POST Invalid Status returns 400 Bad Request', JSON.stringify(resInvalidStatus.body));

        // 8d: Invalid date format
        const resInvalidDate = await httpRequest(baseUrl, 'POST', '/api/opportunities', {
            ...opp1,
            application_deadline: '2026-30-50'
        });
        assert(resInvalidDate.status === 400 && resInvalidDate.body.message.includes('YYYY-MM-DD'),
            'POST Invalid Date returns 400 Bad Request', JSON.stringify(resInvalidDate.body));

        // 8e: Non-numeric ID in GET
        const resInvalidIdGet = await httpRequest(baseUrl, 'GET', '/api/opportunities/abc');
        assert(resInvalidIdGet.status === 400 && resInvalidIdGet.body.message.includes('positive integer'),
            'GET Non-numeric ID returns 400 Bad Request', JSON.stringify(resInvalidIdGet.body));

        // 8f: Negative ID in GET
        const resNegIdGet = await httpRequest(baseUrl, 'GET', '/api/opportunities/-1');
        assert(resNegIdGet.status === 400,
            'GET Negative ID returns 400 Bad Request', JSON.stringify(resNegIdGet.body));

        // 8g: Non-numeric ID in PUT
        const resInvalidIdPut = await httpRequest(baseUrl, 'PUT', '/api/opportunities/xyz', { status: 'Closed' });
        assert(resInvalidIdPut.status === 400,
            'PUT Non-numeric ID returns 400 Bad Request', JSON.stringify(resInvalidIdPut.body));

        // 8h: Non-numeric ID in DELETE
        const resInvalidIdDel = await httpRequest(baseUrl, 'DELETE', '/api/opportunities/invalidId');
        assert(resInvalidIdDel.status === 400,
            'DELETE Non-numeric ID returns 400 Bad Request', JSON.stringify(resInvalidIdDel.body));

        // 8i: Empty body in PUT
        const resEmptyPut = await httpRequest(baseUrl, 'PUT', '/api/opportunities/1', {});
        assert(resEmptyPut.status === 400 && resEmptyPut.body.message.includes('cannot be empty'),
            'PUT Empty Body returns 400 Bad Request', JSON.stringify(resEmptyPut.body));

        console.log('\n=================================================================');
        console.log(`📊 FINAL TEST REPORT: ${passed} PASSED, ${failed} FAILED`);
        console.log('=================================================================\n');

    } finally {
        server.close();
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Fatal test execution failure:', err);
    process.exit(1);
});
