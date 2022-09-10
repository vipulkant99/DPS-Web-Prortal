const specificOrg = '/organizations/:orgID';
const surveyID = ':surveyID';

// Helper enum: defines all site routes
const Routes = {
  SIGN_IN: '/',
  HOMEPAGE: '/home',
  ALL_PEOPLE: '/usersandstaff',
  CREATE_ACCOUNT: '/createAccount',
  CREATE_ORGANIZATION: '/createOrganization',
  ORGANIZATIONS: '/organizations',
  ORGANIZATION: specificOrg,
  ORG_PEOPLE: `${specificOrg}/usersandstaff`,
  SINGLE_USER: `${specificOrg}/singleUser`,
  EDIT_SURVEY: `${specificOrg}/editSurvey/${surveyID}`,
  SURVEYS: '/surveys',
  ADD_ANSWER: '/createAnswer',
  ADD_SURVEY: '/createSurvey',
  ORG_SURVEYS: `${specificOrg}/surveys`,
  VIEW_SURVEY: '/viewSurvey',
  VIEW_ANSWER: '/viewAnswer',
  RESOURCE_LIBRARY: '/resourceLibrary',
  ORG_RESOURCE_LIBRARY: `${specificOrg}/resourceLibrary`,
  VIEW_RESOURCE: '/resourceLibrary/:resourceID',
  EDIT_RESOURCE: '/resourceLibrary/:resourceID/edit',
  VIEW_SURVEYS: `${specificOrg}/view surveys`,
  VIEW_RESOURCEPROG: `${specificOrg}/singleUser/resources`,
};

// Allows org-specific route to be created given org ID and desired route
// Example: createOrgRoute(123, Routes.SURVEYS) --> '/organizations/123/surveys'
export const createOrgRoute = (selectedOrgID, route) => {
  const routeParts = route.split('/');
  const websiteSection = routeParts[routeParts.length - 1];
  return `${Routes.ORGANIZATIONS}/${selectedOrgID}/${websiteSection}`;
};

export const createDoubleOrgRoute = (selectedOrgID, route) => {
  const routeParts = route.split('/');
  const websiteSection1 = routeParts[routeParts.length - 2];
  const websiteSection2 = routeParts[routeParts.length - 1];
  return `${Routes.ORGANIZATIONS}/${selectedOrgID}/${websiteSection1}/${websiteSection2}`;
};

export default Routes;
