import commands from '../../commands';
import Command, { CommandOption, CommandError, CommandValidate } from '../../../../Command';
import * as sinon from 'sinon';
import appInsights from '../../../../appInsights';
import auth from '../../GraphAuth';
const command: Command = require('./groupsetting-add');
import * as assert from 'assert';
import * as request from 'request-promise-native';
import Utils from '../../../../Utils';
import { Service } from '../../../../Auth';

describe(commands.GROUPSETTING_ADD, () => {
  let vorpal: Vorpal;
  let log: string[];
  let cmdInstance: any;
  let cmdInstanceLogSpy: sinon.SinonSpy;
  let trackEvent: any;
  let telemetry: any;

  before(() => {
    sinon.stub(auth, 'restoreAuth').callsFake(() => Promise.resolve());
    sinon.stub(auth, 'ensureAccessToken').callsFake(() => { return Promise.resolve('ABC'); });
    trackEvent = sinon.stub(appInsights, 'trackEvent').callsFake((t) => {
      telemetry = t;
    });
  });

  beforeEach(() => {
    vorpal = require('../../../../vorpal-init');
    log = [];
    cmdInstance = {
      log: (msg: string) => {
        log.push(msg);
      }
    };
    cmdInstanceLogSpy = sinon.spy(cmdInstance, 'log');
    auth.service = new Service();
    telemetry = null;
    (command as any).items = [];
  });

  afterEach(() => {
    Utils.restore([
      vorpal.find,
      request.get,
      request.post
    ]);
  });

  after(() => {
    Utils.restore([
      appInsights.trackEvent,
      auth.ensureAccessToken,
      auth.restoreAuth
    ]);
  });

  it('has correct name', () => {
    assert.equal(command.name.startsWith(commands.GROUPSETTING_ADD), true);
  });

  it('has a description', () => {
    assert.notEqual(command.description, null);
  });

  it('calls telemetry', (done) => {
    cmdInstance.action = command.action();
    cmdInstance.action({ options: {} }, () => {
      try {
        assert(trackEvent.called);
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('logs correct telemetry event', (done) => {
    cmdInstance.action = command.action();
    cmdInstance.action({ options: {} }, () => {
      try {
        assert.equal(telemetry.name, commands.GROUPSETTING_ADD);
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('aborts when not connected to Microsoft Graph', (done) => {
    auth.service = new Service();
    auth.service.connected = false;
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Connect to the Microsoft Graph first')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('adds group setting using default template setting values', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettingTemplates/62375ab9-6b52-47ed-826b-58e47e0e304b`) {
        return Promise.resolve({
          "id": "62375ab9-6b52-47ed-826b-58e47e0e304b", "deletedDateTime": null, "displayName": "Group.Unified", "description": "\n        Setting templates define the different settings that can be used for the associated ObjectSettings. This template defines\n        settings that can be used for Unified Groups.\n      ", "values": [{ "name": "CustomBlockedWordsList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of blocked words for Unified Group displayName and mailNickName." }, { "name": "EnableMSStandardBlockedWords", "type": "System.Boolean", "defaultValue": "false", "description": "A flag indicating whether or not to enable the Microsoft Standard list of blocked words for Unified Group displayName and mailNickName." }, { "name": "ClassificationDescriptions", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of structured strings describing the classification values in the ClassificationList. The structure of the string is: Value: Description" }, { "name": "DefaultClassification", "type": "System.String", "defaultValue": "", "description": "The classification value to be used by default for Unified Group creation." }, { "name": "PrefixSuffixNamingRequirement", "type": "System.String", "defaultValue": "", "description": "A structured string describing how a Unified Group displayName and mailNickname should be structured. Please refer to docs to discover how to structure a valid requirement." }, { "name": "AllowGuestsToBeGroupOwner", "type": "System.Boolean", "defaultValue": "false", "description": "Flag indicating if guests are allowed to be owner in any Unified Group." }, { "name": "AllowGuestsToAccessGroups", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed to access any Unified Group resources." }, { "name": "GuestUsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines for guests." }, { "name": "GroupCreationAllowedGroupId", "type": "System.Guid", "defaultValue": "", "description": "Guid of the security group that is always allowed to create Unified Groups." }, { "name": "AllowToAddGuests", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed in any Unified Group." }, { "name": "UsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines." }, { "name": "ClassificationList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of valid classification values that can be applied to Unified Groups." }, { "name": "EnableGroupCreation", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if group creation feature is on." }]
        });
      }

      return Promise.reject('Invalid request');
    });
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettings` &&
        JSON.stringify(opts.body) === JSON.stringify({
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [
            {
              name: 'CustomBlockedWordsList',
              value: ''
            },
            {
              name: 'EnableMSStandardBlockedWords',
              value: 'false'
            },
            {
              name: 'ClassificationDescriptions',
              value: ''
            },
            {
              name: 'DefaultClassification',
              value: ''
            },
            {
              name: 'PrefixSuffixNamingRequirement',
              value: ''
            },
            {
              name: 'AllowGuestsToBeGroupOwner',
              value: 'false'
            },
            {
              name: 'AllowGuestsToAccessGroups',
              value: 'true'
            },
            {
              name: 'GuestUsageGuidelinesUrl',
              value: ''
            },
            {
              name: 'GroupCreationAllowedGroupId',
              value: ''
            },
            {
              name: 'AllowToAddGuests',
              value: 'true'
            },
            {
              name: 'UsageGuidelinesUrl',
              value: ''
            },
            {
              name: 'ClassificationList',
              value: ''
            },
            {
              name: 'EnableGroupCreation',
              value: 'true'
            }
          ]
        })) {
        return Promise.resolve({
          displayName: null,
          id: 'cb9ede6b-fa00-474c-b34f-dae81102d210',
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [{ "name": "UsageGuidelinesUrl", "value": "" }, { "name": "ClassificationList", "value": "" }, { "name": "DefaultClassification", "value": "" }, { "name": "CustomBlockedWordsList", "value": "" }, { "name": "EnableMSStandardBlockedWords", "value": "false" }, { "name": "ClassificationDescriptions", "value": "" }, { "name": "PrefixSuffixNamingRequirement", "value": "" }, { "name": "AllowGuestsToBeGroupOwner", "value": "false" }, { "name": "AllowGuestsToAccessGroups", "value": "true" }, { "name": "GuestUsageGuidelinesUrl", "value": "" }, { "name": "GroupCreationAllowedGroupId", "value": "" }, { "name": "AllowToAddGuests", "value": "true" }, { "name": "EnableGroupCreation", "value": "true" }]
        });
      }

      return Promise.reject('Invalid request');
    });

    auth.service = new Service();
    auth.service.connected = true;
    auth.service.resource = 'https://graph.microsoft.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          displayName: null,
          id: 'cb9ede6b-fa00-474c-b34f-dae81102d210',
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [{ "name": "UsageGuidelinesUrl", "value": "" }, { "name": "ClassificationList", "value": "" }, { "name": "DefaultClassification", "value": "" }, { "name": "CustomBlockedWordsList", "value": "" }, { "name": "EnableMSStandardBlockedWords", "value": "false" }, { "name": "ClassificationDescriptions", "value": "" }, { "name": "PrefixSuffixNamingRequirement", "value": "" }, { "name": "AllowGuestsToBeGroupOwner", "value": "false" }, { "name": "AllowGuestsToAccessGroups", "value": "true" }, { "name": "GuestUsageGuidelinesUrl", "value": "" }, { "name": "GroupCreationAllowedGroupId", "value": "" }, { "name": "AllowToAddGuests", "value": "true" }, { "name": "EnableGroupCreation", "value": "true" }]
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('adds group setting using default template setting values (debug)', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettingTemplates/62375ab9-6b52-47ed-826b-58e47e0e304b`) {
        return Promise.resolve({
          "id": "62375ab9-6b52-47ed-826b-58e47e0e304b", "deletedDateTime": null, "displayName": "Group.Unified", "description": "\n        Setting templates define the different settings that can be used for the associated ObjectSettings. This template defines\n        settings that can be used for Unified Groups.\n      ", "values": [{ "name": "CustomBlockedWordsList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of blocked words for Unified Group displayName and mailNickName." }, { "name": "EnableMSStandardBlockedWords", "type": "System.Boolean", "defaultValue": "false", "description": "A flag indicating whether or not to enable the Microsoft Standard list of blocked words for Unified Group displayName and mailNickName." }, { "name": "ClassificationDescriptions", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of structured strings describing the classification values in the ClassificationList. The structure of the string is: Value: Description" }, { "name": "DefaultClassification", "type": "System.String", "defaultValue": "", "description": "The classification value to be used by default for Unified Group creation." }, { "name": "PrefixSuffixNamingRequirement", "type": "System.String", "defaultValue": "", "description": "A structured string describing how a Unified Group displayName and mailNickname should be structured. Please refer to docs to discover how to structure a valid requirement." }, { "name": "AllowGuestsToBeGroupOwner", "type": "System.Boolean", "defaultValue": "false", "description": "Flag indicating if guests are allowed to be owner in any Unified Group." }, { "name": "AllowGuestsToAccessGroups", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed to access any Unified Group resources." }, { "name": "GuestUsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines for guests." }, { "name": "GroupCreationAllowedGroupId", "type": "System.Guid", "defaultValue": "", "description": "Guid of the security group that is always allowed to create Unified Groups." }, { "name": "AllowToAddGuests", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed in any Unified Group." }, { "name": "UsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines." }, { "name": "ClassificationList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of valid classification values that can be applied to Unified Groups." }, { "name": "EnableGroupCreation", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if group creation feature is on." }]
        });
      }

      return Promise.reject('Invalid request');
    });
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettings` &&
        JSON.stringify(opts.body) === JSON.stringify({
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [
            {
              name: 'CustomBlockedWordsList',
              value: ''
            },
            {
              name: 'EnableMSStandardBlockedWords',
              value: 'false'
            },
            {
              name: 'ClassificationDescriptions',
              value: ''
            },
            {
              name: 'DefaultClassification',
              value: ''
            },
            {
              name: 'PrefixSuffixNamingRequirement',
              value: ''
            },
            {
              name: 'AllowGuestsToBeGroupOwner',
              value: 'false'
            },
            {
              name: 'AllowGuestsToAccessGroups',
              value: 'true'
            },
            {
              name: 'GuestUsageGuidelinesUrl',
              value: ''
            },
            {
              name: 'GroupCreationAllowedGroupId',
              value: ''
            },
            {
              name: 'AllowToAddGuests',
              value: 'true'
            },
            {
              name: 'UsageGuidelinesUrl',
              value: ''
            },
            {
              name: 'ClassificationList',
              value: ''
            },
            {
              name: 'EnableGroupCreation',
              value: 'true'
            }
          ]
        })) {
        return Promise.resolve({
          displayName: null,
          id: 'cb9ede6b-fa00-474c-b34f-dae81102d210',
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [{ "name": "UsageGuidelinesUrl", "value": "" }, { "name": "ClassificationList", "value": "" }, { "name": "DefaultClassification", "value": "" }, { "name": "CustomBlockedWordsList", "value": "" }, { "name": "EnableMSStandardBlockedWords", "value": "false" }, { "name": "ClassificationDescriptions", "value": "" }, { "name": "PrefixSuffixNamingRequirement", "value": "" }, { "name": "AllowGuestsToBeGroupOwner", "value": "false" }, { "name": "AllowGuestsToAccessGroups", "value": "true" }, { "name": "GuestUsageGuidelinesUrl", "value": "" }, { "name": "GroupCreationAllowedGroupId", "value": "" }, { "name": "AllowToAddGuests", "value": "true" }, { "name": "EnableGroupCreation", "value": "true" }]
        });
      }

      return Promise.reject('Invalid request');
    });

    auth.service = new Service();
    auth.service.connected = true;
    auth.service.resource = 'https://graph.microsoft.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true, templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          displayName: null,
          id: 'cb9ede6b-fa00-474c-b34f-dae81102d210',
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [{ "name": "UsageGuidelinesUrl", "value": "" }, { "name": "ClassificationList", "value": "" }, { "name": "DefaultClassification", "value": "" }, { "name": "CustomBlockedWordsList", "value": "" }, { "name": "EnableMSStandardBlockedWords", "value": "false" }, { "name": "ClassificationDescriptions", "value": "" }, { "name": "PrefixSuffixNamingRequirement", "value": "" }, { "name": "AllowGuestsToBeGroupOwner", "value": "false" }, { "name": "AllowGuestsToAccessGroups", "value": "true" }, { "name": "GuestUsageGuidelinesUrl", "value": "" }, { "name": "GroupCreationAllowedGroupId", "value": "" }, { "name": "AllowToAddGuests", "value": "true" }, { "name": "EnableGroupCreation", "value": "true" }]
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('adds group setting using the specified values', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettingTemplates/62375ab9-6b52-47ed-826b-58e47e0e304b`) {
        return Promise.resolve({
          "id": "62375ab9-6b52-47ed-826b-58e47e0e304b", "deletedDateTime": null, "displayName": "Group.Unified", "description": "\n        Setting templates define the different settings that can be used for the associated ObjectSettings. This template defines\n        settings that can be used for Unified Groups.\n      ", "values": [{ "name": "CustomBlockedWordsList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of blocked words for Unified Group displayName and mailNickName." }, { "name": "EnableMSStandardBlockedWords", "type": "System.Boolean", "defaultValue": "false", "description": "A flag indicating whether or not to enable the Microsoft Standard list of blocked words for Unified Group displayName and mailNickName." }, { "name": "ClassificationDescriptions", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of structured strings describing the classification values in the ClassificationList. The structure of the string is: Value: Description" }, { "name": "DefaultClassification", "type": "System.String", "defaultValue": "", "description": "The classification value to be used by default for Unified Group creation." }, { "name": "PrefixSuffixNamingRequirement", "type": "System.String", "defaultValue": "", "description": "A structured string describing how a Unified Group displayName and mailNickname should be structured. Please refer to docs to discover how to structure a valid requirement." }, { "name": "AllowGuestsToBeGroupOwner", "type": "System.Boolean", "defaultValue": "false", "description": "Flag indicating if guests are allowed to be owner in any Unified Group." }, { "name": "AllowGuestsToAccessGroups", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed to access any Unified Group resources." }, { "name": "GuestUsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines for guests." }, { "name": "GroupCreationAllowedGroupId", "type": "System.Guid", "defaultValue": "", "description": "Guid of the security group that is always allowed to create Unified Groups." }, { "name": "AllowToAddGuests", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed in any Unified Group." }, { "name": "UsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines." }, { "name": "ClassificationList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of valid classification values that can be applied to Unified Groups." }, { "name": "EnableGroupCreation", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if group creation feature is on." }]
        });
      }

      return Promise.reject('Invalid request');
    });
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettings` &&
        JSON.stringify(opts.body) === JSON.stringify({
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [
            {
              name: 'UsageGuidelinesUrl',
              value: 'https://contoso.sharepoint.com/sites/compliance'
            },
            {
              name: 'ClassificationList',
              value: 'HBI, MBI, LBI, GDPR'
            },
            {
              name: 'DefaultClassification',
              value: 'MBI'
            },
            {
              name: 'CustomBlockedWordsList',
              value: ''
            },
            {
              name: 'EnableMSStandardBlockedWords',
              value: 'false'
            },
            {
              name: 'ClassificationDescriptions',
              value: ''
            },
            {
              name: 'PrefixSuffixNamingRequirement',
              value: ''
            },
            {
              name: 'AllowGuestsToBeGroupOwner',
              value: 'false'
            },
            {
              name: 'AllowGuestsToAccessGroups',
              value: 'true'
            },
            {
              name: 'GuestUsageGuidelinesUrl',
              value: ''
            },
            {
              name: 'GroupCreationAllowedGroupId',
              value: ''
            },
            {
              name: 'AllowToAddGuests',
              value: 'true'
            },
            {
              name: 'EnableGroupCreation',
              value: 'true'
            }
          ]
        })) {
        return Promise.resolve({
          displayName: null,
          id: 'cb9ede6b-fa00-474c-b34f-dae81102d210',
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [{ "name": "UsageGuidelinesUrl", "value": "https://contoso.sharepoint.com/sites/compliance" }, { "name": "ClassificationList", "value": "HBI, MBI, LBI, GDPR" }, { "name": "DefaultClassification", "value": "MBI" }, { "name": "CustomBlockedWordsList", "value": "" }, { "name": "EnableMSStandardBlockedWords", "value": "false" }, { "name": "ClassificationDescriptions", "value": "" }, { "name": "PrefixSuffixNamingRequirement", "value": "" }, { "name": "AllowGuestsToBeGroupOwner", "value": "false" }, { "name": "AllowGuestsToAccessGroups", "value": "true" }, { "name": "GuestUsageGuidelinesUrl", "value": "" }, { "name": "GroupCreationAllowedGroupId", "value": "" }, { "name": "AllowToAddGuests", "value": "true" }, { "name": "EnableGroupCreation", "value": "true" }]
        });
      }

      return Promise.reject('Invalid request');
    });

    auth.service = new Service();
    auth.service.connected = true;
    auth.service.resource = 'https://graph.microsoft.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b', UsageGuidelinesUrl: 'https://contoso.sharepoint.com/sites/compliance', ClassificationList: 'HBI, MBI, LBI, GDPR', DefaultClassification: 'MBI' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          displayName: null,
          id: 'cb9ede6b-fa00-474c-b34f-dae81102d210',
          templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b',
          values: [{ "name": "UsageGuidelinesUrl", "value": "https://contoso.sharepoint.com/sites/compliance" }, { "name": "ClassificationList", "value": "HBI, MBI, LBI, GDPR" }, { "name": "DefaultClassification", "value": "MBI" }, { "name": "CustomBlockedWordsList", "value": "" }, { "name": "EnableMSStandardBlockedWords", "value": "false" }, { "name": "ClassificationDescriptions", "value": "" }, { "name": "PrefixSuffixNamingRequirement", "value": "" }, { "name": "AllowGuestsToBeGroupOwner", "value": "false" }, { "name": "AllowGuestsToAccessGroups", "value": "true" }, { "name": "GuestUsageGuidelinesUrl", "value": "" }, { "name": "GroupCreationAllowedGroupId", "value": "" }, { "name": "AllowToAddGuests", "value": "true" }, { "name": "EnableGroupCreation", "value": "true" }]
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('handles error when no template with the specified id found', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      return Promise.reject({
        error: {
          "error": {
            "code": "Request_ResourceNotFound",
            "message": "Resource '62375ab9-6b52-47ed-826b-58e47e0e304c' does not exist or one of its queried reference-property objects are not present.",
            "innerError": {
              "request-id": "fe2491f9-53e7-407c-9a08-b92b2bf6722b",
              "date": "2018-05-11T17:06:22"
            }
          }
        }
      });
    });

    auth.service = new Service();
    auth.service.connected = true;
    auth.service.resource = 'https://graph.microsoft.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, id: '62375ab9-6b52-47ed-826b-58e47e0e304c' } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError(`Resource '62375ab9-6b52-47ed-826b-58e47e0e304c' does not exist or one of its queried reference-property objects are not present.`)));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('handles error when group setting already exists', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url === `https://graph.microsoft.com/v1.0/groupSettingTemplates/62375ab9-6b52-47ed-826b-58e47e0e304b`) {
        return Promise.resolve({
          "id": "62375ab9-6b52-47ed-826b-58e47e0e304b", "deletedDateTime": null, "displayName": "Group.Unified", "description": "\n        Setting templates define the different settings that can be used for the associated ObjectSettings. This template defines\n        settings that can be used for Unified Groups.\n      ", "values": [{ "name": "CustomBlockedWordsList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of blocked words for Unified Group displayName and mailNickName." }, { "name": "EnableMSStandardBlockedWords", "type": "System.Boolean", "defaultValue": "false", "description": "A flag indicating whether or not to enable the Microsoft Standard list of blocked words for Unified Group displayName and mailNickName." }, { "name": "ClassificationDescriptions", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of structured strings describing the classification values in the ClassificationList. The structure of the string is: Value: Description" }, { "name": "DefaultClassification", "type": "System.String", "defaultValue": "", "description": "The classification value to be used by default for Unified Group creation." }, { "name": "PrefixSuffixNamingRequirement", "type": "System.String", "defaultValue": "", "description": "A structured string describing how a Unified Group displayName and mailNickname should be structured. Please refer to docs to discover how to structure a valid requirement." }, { "name": "AllowGuestsToBeGroupOwner", "type": "System.Boolean", "defaultValue": "false", "description": "Flag indicating if guests are allowed to be owner in any Unified Group." }, { "name": "AllowGuestsToAccessGroups", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed to access any Unified Group resources." }, { "name": "GuestUsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines for guests." }, { "name": "GroupCreationAllowedGroupId", "type": "System.Guid", "defaultValue": "", "description": "Guid of the security group that is always allowed to create Unified Groups." }, { "name": "AllowToAddGuests", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if guests are allowed in any Unified Group." }, { "name": "UsageGuidelinesUrl", "type": "System.String", "defaultValue": "", "description": "A link to the Group Usage Guidelines." }, { "name": "ClassificationList", "type": "System.String", "defaultValue": "", "description": "A comma-delimited list of valid classification values that can be applied to Unified Groups." }, { "name": "EnableGroupCreation", "type": "System.Boolean", "defaultValue": "true", "description": "Flag indicating if group creation feature is on." }]
        });
      }

      return Promise.reject('Invalid request');
    });
    sinon.stub(request, 'post').callsFake((opts) => {
      return Promise.reject({
        error: {
          "error": {
            "code": "Request_BadRequest",
            "message": "A conflicting object with one or more of the specified property values is present in the directory.",
            "innerError": {
              "request-id": "7b7eacbb-3b0e-4758-be20-6410957e42d6",
              "date": "2018-05-11T17:10:34"
            }
          }
        }
      });
    });

    auth.service = new Service();
    auth.service.connected = true;
    auth.service.resource = 'https://graph.microsoft.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, templateId: '62375ab9-6b52-47ed-826b-58e47e0e304b' } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError(`A conflicting object with one or more of the specified property values is present in the directory.`)));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('fails validation if the templateId not specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: {} });
    assert.notEqual(actual, true);
  });

  it('fails validation if the templateId is not a valid GUID', () => {
    const actual = (command.validate() as CommandValidate)({ options: { templateId: 'invalid' } });
    assert.notEqual(actual, true);
  });

  it('passes validation if the templateId is a valid GUID', () => {
    const actual = (command.validate() as CommandValidate)({ options: { templateId: '68be84bf-a585-4776-80b3-30aa5207aa22' } });
    assert.equal(actual, true);
  });

  it('allows unknown properties', () => {
    const allowUnknownOptions = command.allowUnknownOptions();
    assert.equal(allowUnknownOptions, true);
  });

  it('supports debug mode', () => {
    const options = (command.options() as CommandOption[]);
    let containsOption = false;
    options.forEach(o => {
      if (o.option === '--debug') {
        containsOption = true;
      }
    });
    assert(containsOption);
  });

  it('has help referring to the right command', () => {
    const cmd: any = {
      log: (msg: string) => { },
      prompt: () => { },
      helpInformation: () => { }
    };
    const find = sinon.stub(vorpal, 'find').callsFake(() => cmd);
    cmd.help = command.help();
    cmd.help({}, () => { });
    assert(find.calledWith(commands.GROUPSETTING_ADD));
  });

  it('has help with examples', () => {
    const _log: string[] = [];
    const cmd: any = {
      log: (msg: string) => {
        _log.push(msg);
      },
      prompt: () => { },
      helpInformation: () => { }
    };
    sinon.stub(vorpal, 'find').callsFake(() => cmd);
    cmd.help = command.help();
    cmd.help({}, () => { });
    let containsExamples: boolean = false;
    _log.forEach(l => {
      if (l && l.indexOf('Examples:') > -1) {
        containsExamples = true;
      }
    });
    Utils.restore(vorpal.find);
    assert(containsExamples);
  });

  it('correctly handles lack of valid access token', (done) => {
    Utils.restore(auth.ensureAccessToken);
    sinon.stub(auth, 'ensureAccessToken').callsFake(() => { return Promise.reject(new Error('Error getting access token')); });
    auth.service = new Service();
    auth.service.connected = true;
    auth.service.resource = 'https://graph.microsoft.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Error getting access token')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });
});