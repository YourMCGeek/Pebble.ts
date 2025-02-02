import ApiRequestHandler from '../functions/ApiRequestHandler';
import { ActivityLogResponse } from '../types/account/activityLog';
import {
    ServerListResponse,
    ServerAttributes,
    SftpDetails,
    Limits,
    FeatureLimits,
    Relationships,
    Node,
    StatsDetails,
} from '../types/server/server';

export class ServerClient {
    private requestHandler: ApiRequestHandler;

    constructor(requestHandler: ApiRequestHandler) {
        this.requestHandler = requestHandler;
    }

    async getServers(): Promise<ServerListResponse> {
        const endpoint = await this.requestHandler.request({ url: '/client', method: 'GET' });
        return endpoint;
    }

    async getServerByUUID(uuid: string): Promise<ServerObject> {
        const endpoint = await this.requestHandler.request({ url: `/client/servers/${uuid}`, method: 'GET' });
        return new ServerObject(this.requestHandler, endpoint.data);
    }
}

class ServerObject implements ServerAttributes {
    private requestHandler: ApiRequestHandler;
    attributes: ServerAttributes;
    server_owner: boolean;
    identifier: string;
    internal_id: number;
    external_id: string;
    parent: string;
    uuid: string;
    name: string;
    is_node_under_maintenance: boolean;
    in_conflict_state: boolean;
    sftp_details: SftpDetails;
    description: string;
    limits: Limits;
    abilities: string;
    invocation: string;
    docker_image: string;
    egg_features: string[];
    egg_name: string;
    bot_type: string;
    owner_id: string;
    owner_email: string;
    feature_limits: FeatureLimits;
    action: string;
    status: string;
    status_reason: string;
    is_transferring: boolean;
    subdomain: string;
    node: Node;
    migrate_by: string;
    relationships: Relationships;

    constructor(api: ApiRequestHandler, attributes: ServerAttributes) {
        this.server_owner = attributes?.server_owner;
        this.identifier = attributes?.identifier;
        this.internal_id = attributes?.internal_id;
        this.external_id = attributes?.external_id;
        this.parent = attributes?.parent;
        this.uuid = attributes?.uuid;
        this.name = attributes?.name;
        this.is_node_under_maintenance = attributes?.is_node_under_maintenance;
        this.in_conflict_state = attributes?.in_conflict_state;
        this.sftp_details = attributes?.sftp_details;
        this.description = attributes?.description;
        this.limits = attributes?.limits;
        this.abilities = attributes?.abilities;
        this.invocation = attributes?.invocation;
        this.docker_image = attributes?.docker_image;
        this.egg_features = attributes?.egg_features;
        this.egg_name = attributes?.egg_name;
        this.bot_type = attributes?.bot_type;
        this.owner_id = attributes?.owner_id;
        this.owner_email = attributes?.owner_email; ``
        this.feature_limits = attributes?.feature_limits;
        this.action = attributes?.action;
        this.status = attributes?.status;
        this.status_reason = attributes?.status_reason; ``
        this.is_transferring = attributes?.is_transferring;
        this.subdomain = attributes?.subdomain;
        this.node = attributes?.node;
        this.migrate_by = attributes?.migrate_by;
        this.relationships = attributes?.relationships;
        this.requestHandler = api;
        this.attributes = attributes;
    }

    async getDetails(): Promise<ServerAttributes> {
        return this.attributes;
    }

    async getResources(): Promise<StatsDetails> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/resources`,
            method: 'GET',
        });
        return endpoint.data;
    }

    async getActivityLogs(
        include?: string[],
        filterActorsId?: string,
        filterEvent?: string,
        sort?: string,
        sortDescending?: boolean,
        page?: number,
        maxPerPage?: number,
    ): Promise<ActivityLogResponse> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/activity`,
            method: 'GET',
            data: {
                include: include,
                'filters[actor_id]': filterActorsId,
                'filters[event]': filterEvent,
                sort: `${sortDescending ? '-' : ''}${sort}`,
                page: page,
                per_page: maxPerPage,
            },
        });
        return endpoint;
    }

    // FIXME: Undocumented response
    async getActivityFilters(): Promise<string[]> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/activity/filters`,
            method: 'GET',
        });
        return endpoint.data;
    }

    // FIXME: Undocumented response
    async getAnalytics(days: number): Promise<any> {
        if (days > 10) {
            return Promise.reject(new Error('The maximum number of days that can be requested is 10.'));
        }
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/analytics`,
            method: 'GET',
            data: { days: days },
        });
        return endpoint.data;
    }

    async startImport(hostname: string, port: 2022 | number, username: string, password: string) {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/import`,
            method: 'POST',
            data: { hostname: hostname, port: port, username: username, password: password },
        });
        return endpoint;
    }

    async getAvailableMigrationLocations(): Promise<string[]> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/migration`,
            method: 'GET',
        });
        return endpoint.data;
    }

    async startMigration(location: string) {
        if (location.length > 2) {
            return Promise.reject(
                new Error(
                    'The location must be a valid location. Use getAvailableMigrationLocations() to get a list of available locations.',
                ),
            );
        }
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/migration`,
            method: 'POST',
            data: { location: location },
        });
        return endpoint;
    }

    // FIXME: Undocumented response
    // TODO: Check to see if user is admin, if not, return error
    async getMigrationDetails() {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/migration/details`,
            method: 'GET',
        });
        return endpoint.data;
    }

    // FIXME: Undocumented response
    // TODO: Check to see if user is admin, if not, return error
    async startTransfer(newNodeId: string) {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/transfer`,
            method: 'POST',
            data: { node_id: newNodeId },
        });
        return endpoint;
    }

    async renameServer(name: string, description: string) {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/settings/rename`,
            method: 'POST',
            data: { name: name, description: description },
        });
        return endpoint;
    }

    async setSubdomain(subdomain: string) {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/settings/subdomain`,
            method: 'POST',
            data: { subdomain: subdomain },
        });
        return endpoint;
    }

    // FIXME: Undocumented response
    async getNodeJSVersions(): Promise<string[]> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/bot-node-versions`,
            method: 'GET',
        });
        return endpoint.data;
    }

    // FIXME: Undocumented response
    async getBotPreinstalls(): Promise<string[]> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/bot-preinstalls`,
            method: 'GET',
        });
        return endpoint.data;
    }

    async startBotPreinstall(preinstall: string) {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/bot-preinstalls`,
            method: 'POST',
            data: { preinstall: preinstall },
        });
        return endpoint;
    }

    // FIXME: Undocumented response
    async getNotices(): Promise<string[]> {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/notices`,
            method: 'GET',
        });
        return endpoint.data;
    }

    async dismissResourceNotice() {
        const endpoint = await this.requestHandler.request({
            url: `/client/servers/${this.attributes.uuid}/notices/resources`,
            method: 'DELETE',
        });
        return endpoint;
    }

    // TODO: Add in other getter properties just pulling from SererAttributes, e.g limits, owner, sftpdetails, etc.
}

export default ServerClient;
