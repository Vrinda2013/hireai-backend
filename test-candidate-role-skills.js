import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testCandidateRoleSkills() {
  try {
    console.log('🧪 Testing Candidate Role Skills CRUD Operations...\n');

    // Test 1: Create a new role-skill mapping
    console.log('1. Creating a new role-skill mapping...');
    const createResponse = await fetch(`${BASE_URL}/api/candidate-role-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        description: 'Full-stack software engineer with modern web technologies',
        category: 'technical',
        experienceLevel: 'mid'
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Role-skill mapping created:', createData.data);
      
      const roleId = createData.data._id;
      
      // Test 2: Get all role-skill mappings
      console.log('\n2. Getting all role-skill mappings...');
      const getAllResponse = await fetch(`${BASE_URL}/api/candidate-role-skills`);
      const getAllData = await getAllResponse.json();
      console.log('✅ All role-skill mappings:', getAllData.data.length, 'found');

      // Test 3: Get role-skill by ID
      console.log('\n3. Getting role-skill by ID...');
      const getByIdResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/${roleId}`);
      const getByIdData = await getByIdResponse.json();
      console.log('✅ Role-skill by ID:', getByIdData.data.role);

      // Test 4: Update role-skill
      console.log('\n4. Updating role-skill...');
      const updateResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Updated description for Software Engineer role',
          experienceLevel: 'senior'
        })
      });
      const updateData = await updateResponse.json();
      console.log('✅ Role-skill updated:', updateData.data.description);

      // Test 5: Add skill to role
      console.log('\n5. Adding skill to role...');
      const addSkillResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/${roleId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill: 'TypeScript'
        })
      });
      const addSkillData = await addSkillResponse.json();
      console.log('✅ Skill added:', addSkillData.data.skills);

      // Test 6: Search roles by skills
      console.log('\n6. Searching roles by skills...');
      const searchResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/search/skills?skills=JavaScript&skills=React`);
      const searchData = await searchResponse.json();
      console.log('✅ Roles found for skills:', searchData.count);

      // Test 7: Get all skills
      console.log('\n7. Getting all skills...');
      const skillsResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/skills/all`);
      const skillsData = await skillsResponse.json();
      console.log('✅ All skills:', skillsData.data);

      // Test 8: Get roles by category
      console.log('\n8. Getting roles by category...');
      const categoryResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/category/technical`);
      const categoryData = await categoryResponse.json();
      console.log('✅ Roles in technical category:', categoryData.count);

      // Test 9: Remove skill from role
      console.log('\n9. Removing skill from role...');
      const removeSkillResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/${roleId}/skills/TypeScript`, {
        method: 'DELETE'
      });
      const removeSkillData = await removeSkillResponse.json();
      console.log('✅ Skill removed:', removeSkillData.data.skills);

      // Test 10: Delete role-skill (soft delete)
      console.log('\n10. Deleting role-skill (soft delete)...');
      const deleteResponse = await fetch(`${BASE_URL}/api/candidate-role-skills/${roleId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ Role-skill deleted:', deleteData.message);

    } else {
      const error = await createResponse.json();
      console.log('❌ Create failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCandidateRoleSkills(); 