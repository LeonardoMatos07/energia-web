export interface paths {
    "/v1/curtailment/subsystems": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["subsystem_curtailment_v1_curtailment_subsystems_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/curtailment/states/{state}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["state_curtailment_v1_curtailment_states__state__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_plants_v1_plants_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plants/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_plant_v1_plants__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ranking": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ranking_v1_ranking_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/months": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["months_v1_months_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_reports_v1_reports_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_report_v1_reports__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/newsletter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["subscribe_v1_newsletter_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/newsletter/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["confirm_v1_newsletter_confirm_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/newsletter/unsubscribe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["unsubscribe_v1_newsletter_unsubscribe_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/load-runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_load_runs_v1_admin_load_runs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_all_reports_v1_admin_reports_get"];
        put?: never;
        post: operations["upsert_report_v1_admin_reports_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/revalidate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["revalidate_v1_admin_revalidate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["health_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AdminReport: {
            month: string;
            title: string;
            slug: string;
            summary: string | null;
            published_at: string | null;
            content: string;
            created_at: string;
            updated_at: string;
        };
        AdminReportListResponse: {
            items: components["schemas"]["AdminReport"][];
        };
        ConfirmedResponse: {
            confirmed: boolean;
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        HealthResponse: {
            status: string;
            database: string;
        };
        LoadRun: {
            id: number;
            dataset: string;
            period: string | null;
            source_file: string | null;
            checksum: string | null;
            row_count: number | null;
            started_at: string;
            finished_at: string | null;
            status: "running" | "success" | "failed";
            detail: string | null;
        };
        LoadRunListResponse: {
            items: components["schemas"]["LoadRun"][];
        };
        MessageResponse: {
            message: string;
        };
        MonthsResponse: {
            months: string[];
        };
        NewsletterSignup: {
            email: string;
            consent: true;
            source?: string | null;
        };
        Plant: {
            id: string;
            kind: "plant" | "cluster";
            name: string;
            slug: string;
            source: "wind" | "solar";
            state: string;
            subsystem: string;
            capacity_mw: number | null;
            cluster_id: string | null;
            ceg: string | null;
            connection_point: string | null;
            operator: string | null;
            updated_at: string;
        };
        PlantCurtailment: {
            plant_id: string;
            month: string;
            verified_generation_mwh: number;
            curtailed_mwh: number;
            curtailment_pct: number | null;
            curtailed_rel_mwh: number;
            curtailed_cnf_mwh: number;
            curtailed_ene_mwh: number;
            curtailed_other_mwh: number;
            estimated_loss_brl: number | null;
            price_basis: string | null;
            restricted_hours: number;
            state_avg_curtailment_pct: number | null;
            national_rank: number | null;
            state_rank: number | null;
            updated_at: string;
        };
        PlantDetailResponse: {
            plant: components["schemas"]["Plant"];
            cluster: components["schemas"]["PlantSummary"] | null;
            cluster_plants: components["schemas"]["PlantSummary"][];
            series: components["schemas"]["PlantCurtailment"][];
        };
        PlantListResponse: {
            items: components["schemas"]["PlantSummary"][];
            total: number;
            page: number;
            page_size: number;
        };
        PlantSummary: {
            id: string;
            kind: "plant" | "cluster";
            name: string;
            slug: string;
            source: "wind" | "solar";
            state: string;
            subsystem: string;
            capacity_mw: number | null;
        };
        RankedPlant: {
            id: string;
            kind: "plant" | "cluster";
            name: string;
            slug: string;
            source: "wind" | "solar";
            state: string;
            subsystem: string;
            capacity_mw: number | null;
            rank: number;
            curtailed_mwh: number;
            curtailment_pct: number | null;
            estimated_loss_brl: number | null;
        };
        RankingResponse: {
            month: string | null;
            items: components["schemas"]["RankedPlant"][];
        };
        Report: {
            month: string;
            title: string;
            slug: string;
            summary: string | null;
            published_at: string | null;
            content: string;
        };
        ReportInput: {
            month: string;
            title: string;
            slug?: string | null;
            summary?: string | null;
            content: string;
            publish: boolean;
        };
        ReportListResponse: {
            items: components["schemas"]["ReportSummary"][];
        };
        ReportSummary: {
            month: string;
            title: string;
            slug: string;
            summary: string | null;
            published_at: string | null;
        };
        RevalidateInput: {
            tags?: ("curtailment" | "plants" | "reports")[];
        };
        RevalidateResponse: {
            tags: ("curtailment" | "plants" | "reports")[];
            cache_cleared: boolean;
            entries_removed: number;
            web_revalidated: boolean;
            detail: string | null;
        };
        StateCurtailment: {
            source: "wind" | "solar" | "total";
            month: string;
            verified_generation_mwh: number;
            curtailed_mwh: number;
            curtailment_pct: number | null;
            curtailed_rel_mwh: number;
            curtailed_cnf_mwh: number;
            curtailed_ene_mwh: number;
            curtailed_other_mwh: number;
            estimated_loss_brl: number | null;
            affected_plants: number;
            updated_at: string;
            state: string;
        };
        StateCurtailmentResponse: {
            series: components["schemas"]["StateCurtailment"][];
            ranking: components["schemas"]["RankedPlant"][];
            ranking_month: string | null;
        };
        SubsystemCurtailment: {
            source: "wind" | "solar" | "total";
            month: string;
            verified_generation_mwh: number;
            curtailed_mwh: number;
            curtailment_pct: number | null;
            curtailed_rel_mwh: number;
            curtailed_cnf_mwh: number;
            curtailed_ene_mwh: number;
            curtailed_other_mwh: number;
            estimated_loss_brl: number | null;
            affected_plants: number;
            updated_at: string;
            subsystem: string;
        };
        SubsystemCurtailmentResponse: {
            items: components["schemas"]["SubsystemCurtailment"][];
        };
        UnsubscribedResponse: {
            unsubscribed: boolean;
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
            input?: unknown;
            ctx?: Record<string, never>;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    subsystem_curtailment_v1_curtailment_subsystems_get: {
        parameters: {
            query?: {
                source?: "wind" | "solar" | "total";
                start?: string | null;
                end?: string | null;
                subsystem?: ("N" | "NE" | "S" | "SE" | "SIN") | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubsystemCurtailmentResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    state_curtailment_v1_curtailment_states__state__get: {
        parameters: {
            query?: {
                source?: "wind" | "solar" | "total";
                month?: string | null;
            };
            header?: never;
            path: {
                state: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StateCurtailmentResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_plants_v1_plants_get: {
        parameters: {
            query?: {
                search?: string | null;
                state?: string | null;
                source?: ("wind" | "solar") | null;
                kind?: ("plant" | "cluster") | null;
                page?: number;
                page_size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlantListResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_plant_v1_plants__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlantDetailResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ranking_v1_ranking_get: {
        parameters: {
            query?: {
                month?: string | null;
                state?: string | null;
                source?: "wind" | "solar" | "total";
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RankingResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    months_v1_months_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthsResponse"];
                };
            };
        };
    };
    list_reports_v1_reports_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportListResponse"];
                };
            };
        };
    };
    get_report_v1_reports__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Report"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    subscribe_v1_newsletter_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NewsletterSignup"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirm_v1_newsletter_confirm_get: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfirmedResponse"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    unsubscribe_v1_newsletter_unsubscribe_get: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UnsubscribedResponse"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_load_runs_v1_admin_load_runs_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoadRunListResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_all_reports_v1_admin_reports_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReportListResponse"];
                };
            };
        };
    };
    upsert_report_v1_admin_reports_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportInput"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReport"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    revalidate_v1_admin_revalidate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["RevalidateInput"] | null;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevalidateResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    health_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
}
