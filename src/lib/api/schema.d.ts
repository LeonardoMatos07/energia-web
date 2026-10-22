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
    "/v1/curtailment/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["summary_v1_curtailment_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/curtailment/hourly": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["hourly_v1_curtailment_hourly_get"];
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
    "/v1/rankings/operators": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["operators_v1_rankings_operators_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/rankings/connection-points": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["connection_points_v1_rankings_connection_points_get"];
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
    "/v1/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["signup_v1_auth_signup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["verify_email_v1_auth_verify_email_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/resend-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["resend_verification_v1_auth_resend_verification_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["login_v1_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["me_v1_auth_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["logout_v1_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["forgot_password_v1_auth_forgot_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reset_password_v1_auth_reset_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/me/delete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["delete_account_v1_auth_me_delete_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ingest_v1_events_post"];
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
    "/v1/admin/leads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_leads_v1_admin_leads_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/usage/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["usage_overview_v1_admin_usage_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/usage/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["usage_events_v1_admin_usage_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/usage/events.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["usage_events_csv_v1_admin_usage_events_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/usage/members/{member_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["member_timeline_v1_admin_usage_members__member_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/usage/purge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["usage_purge_v1_admin_usage_purge_post"];
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
        ActiveLead: {
            member_id: string;
            name: string;
            email: string;
            organization: string | null;
            role: string;
            lead_tier: string;
            lead_score: number;
            events: number;
            last_seen: string | null;
        };
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
        CountItem: {
            name: string;
            count: number;
        };
        CurtailmentSummary: {
            scope: string;
            source: "wind" | "solar" | "total";
            start: string | null;
            end: string | null;
            months: number;
            verified_generation_mwh: number;
            curtailed_mwh: number;
            curtailed_rel_mwh: number;
            curtailed_cnf_mwh: number;
            curtailed_ene_mwh: number;
            curtailed_other_mwh: number;
            curtailment_pct: number | null;
            estimated_loss_brl: number | null;
            affected_plants: number;
        };
        DailyUsage: {
            day: string;
            page_views: number;
            interactions: number;
            members: number;
        };
        EmailOnly: {
            email: string;
        };
        EntityUsage: {
            entity_type: string;
            entity_id: string;
            views: number;
            members: number;
        };
        EventBatch: {
            events: components["schemas"]["EventInput"][];
            visitor_id?: string | null;
            session_key?: string | null;
            user_agent?: string | null;
            referrer?: string | null;
            request_id?: string | null;
        };
        EventInput: {
            category: "page" | "interaction";
            action: string;
            path?: string | null;
            query?: {
                [key: string]: string;
            } | null;
            section?: string | null;
            entity_type?: string | null;
            entity_id?: string | null;
            properties?: {
                [key: string]: unknown;
            };
        };
        EventsAccepted: {
            accepted: number;
        };
        FunnelStep: {
            step: string;
            count: number;
        };
        GroupRankingResponse: {
            group: "operator" | "connection_point";
            source: "wind" | "solar" | "total";
            start: string | null;
            end: string | null;
            items: components["schemas"]["RankedGroup"][];
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        HealthResponse: {
            status: string;
            database: string;
        };
        HourlyPoint: {
            day_type: "weekday" | "weekend";
            hour: number;
            avg_curtailed_mwh: number;
            avg_generation_mwh: number;
            curtailment_pct: number | null;
        };
        HourlyProfileResponse: {
            scope: string;
            source: "wind" | "solar" | "total";
            start: string | null;
            end: string | null;
            months: number;
            points: components["schemas"]["HourlyPoint"][];
        };
        Lead: {
            id: string;
            email: string;
            name: string;
            role: "researcher" | "student" | "professional" | "journalist" | "public_sector" | "investor" | "other";
            organization: string | null;
            job_title: string | null;
            segment: string | null;
            institution: string | null;
            regions: string[];
            plants: string[];
            interests: string[];
            created_at: string;
            company_size: string | null;
            study_level: string | null;
            phone: string | null;
            referral: string | null;
            signup_source: string | null;
            marketing_opt_in: boolean;
            email_verified_at: string | null;
            lead_score: number;
            lead_tier: "hot" | "warm" | "cold";
            last_login_at: string | null;
        };
        LeadListResponse: {
            items: components["schemas"]["Lead"][];
            total: number;
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
        LoginResponse: {
            session_token: string;
            expires_at: string;
            member: components["schemas"]["MemberProfile"];
        };
        MemberLogin: {
            email: string;
            password: string;
        };
        MemberProfile: {
            id: string;
            email: string;
            name: string;
            role: "researcher" | "student" | "professional" | "journalist" | "public_sector" | "investor" | "other";
            organization: string | null;
            job_title: string | null;
            segment: string | null;
            institution: string | null;
            regions: string[];
            plants: string[];
            interests: string[];
            created_at: string;
        };
        MemberSignup: {
            email: string;
            password: string;
            name: string;
            role: "researcher" | "student" | "professional" | "journalist" | "public_sector" | "investor" | "other";
            organization?: string | null;
            job_title?: string | null;
            segment?: ("generator" | "storage_developer" | "trader" | "consultancy" | "financial" | "consumer" | "utility" | "equipment" | "law_regulatory" | "other") | null;
            company_size?: ("1-10" | "11-50" | "51-200" | "201-1000" | "1000+") | null;
            institution?: string | null;
            study_level?: ("undergraduate" | "master" | "phd" | "postdoc" | "other") | null;
            regions?: ("Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul")[];
            plants?: string[];
            interests?: ("monitor_losses" | "compensation" | "storage" | "free_market" | "investment" | "data_api" | "research" | "press")[];
            phone?: string | null;
            referral?: string | null;
            marketing_opt_in: boolean;
            consent: true;
            source?: string | null;
        };
        MemberTimeline: {
            member: components["schemas"]["Lead"];
            events: components["schemas"]["UsageEventOut"][];
            total: number;
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
        PasswordConfirmation: {
            password: string;
        };
        PasswordReset: {
            token: string;
            password: string;
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
        PurgeResponse: {
            deleted: number;
            older_than_days: number;
        };
        RankedGroup: {
            rank: number;
            name: string;
            state: string | null;
            plants: number;
            affected_plants: number;
            verified_generation_mwh: number;
            curtailed_mwh: number;
            curtailment_pct: number | null;
            estimated_loss_brl: number | null;
            compensable_mwh: number;
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
        RoleUsage: {
            role: string | null;
            segment: string | null;
            members: number;
            events: number;
        };
        SectionUsage: {
            section: string;
            views: number;
            members: number;
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
        TokenOnly: {
            token: string;
        };
        UnsubscribedResponse: {
            unsubscribed: boolean;
        };
        UsageEventList: {
            items: components["schemas"]["UsageEventOut"][];
            total: number;
        };
        UsageEventOut: {
            id: number;
            occurred_at: string;
            category: string;
            action: string;
            section: string | null;
            entity_type: string | null;
            entity_id: string | null;
            path: string | null;
            properties: {
                [key: string]: unknown;
            };
            member_id: string | null;
            member_role: string | null;
            member_segment: string | null;
            visitor_id: string | null;
            session_key: string | null;
            device: string | null;
            is_bot: boolean;
            referrer: string | null;
            request_id: string | null;
        };
        UsageSummary: {
            start: string;
            end: string;
            days: number;
            include_bots: boolean;
            totals: components["schemas"]["UsageTotals"];
            daily: components["schemas"]["DailyUsage"][];
            sections: components["schemas"]["SectionUsage"][];
            entities: components["schemas"]["EntityUsage"][];
            searches: components["schemas"]["CountItem"][];
            interactions: components["schemas"]["CountItem"][];
            compared: components["schemas"]["CountItem"][];
            funnel: components["schemas"]["FunnelStep"][];
            roles: components["schemas"]["RoleUsage"][];
            active_leads: components["schemas"]["ActiveLead"][];
        };
        UsageTotals: {
            events: number;
            page_views: number;
            members_active: number;
            visitors: number;
            sessions: number;
            new_members: number;
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
            input?: unknown;
            ctx?: Record<string, never>;
        };
        VerifiedResponse: {
            verified: boolean;
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
    summary_v1_curtailment_summary_get: {
        parameters: {
            query?: {
                scope?: string;
                source?: "wind" | "solar" | "total";
                start?: string | null;
                end?: string | null;
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
                    "application/json": components["schemas"]["CurtailmentSummary"];
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
    hourly_v1_curtailment_hourly_get: {
        parameters: {
            query?: {
                scope?: "N" | "NE" | "S" | "SE" | "SIN";
                source?: "wind" | "solar" | "total";
                start?: string | null;
                end?: string | null;
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
                    "application/json": components["schemas"]["HourlyProfileResponse"];
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
    operators_v1_rankings_operators_get: {
        parameters: {
            query?: {
                source?: "wind" | "solar" | "total";
                start?: string | null;
                end?: string | null;
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
                    "application/json": components["schemas"]["GroupRankingResponse"];
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
    connection_points_v1_rankings_connection_points_get: {
        parameters: {
            query?: {
                source?: "wind" | "solar" | "total";
                start?: string | null;
                end?: string | null;
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
                    "application/json": components["schemas"]["GroupRankingResponse"];
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
    signup_v1_auth_signup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberSignup"];
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
    verify_email_v1_auth_verify_email_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenOnly"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VerifiedResponse"];
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
    resend_verification_v1_auth_resend_verification_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailOnly"];
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
        };
    };
    login_v1_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberLogin"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
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
    me_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
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
                    "application/json": components["schemas"]["MemberProfile"];
                };
            };
            401: {
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
    logout_v1_auth_logout_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
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
        };
    };
    forgot_password_v1_auth_forgot_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailOnly"];
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
        };
    };
    reset_password_v1_auth_reset_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordReset"];
            };
        };
        responses: {
            200: {
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
        };
    };
    delete_account_v1_auth_me_delete_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordConfirmation"];
            };
        };
        responses: {
            200: {
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
        };
    };
    ingest_v1_events_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EventBatch"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EventsAccepted"];
                };
            };
            401: {
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
    list_leads_v1_admin_leads_get: {
        parameters: {
            query?: {
                tier?: ("hot" | "warm" | "cold") | null;
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
                    "application/json": components["schemas"]["LeadListResponse"];
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
    usage_overview_v1_admin_usage_summary_get: {
        parameters: {
            query?: {
                days?: number;
                include_bots?: boolean;
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
                    "application/json": components["schemas"]["UsageSummary"];
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
    usage_events_v1_admin_usage_events_get: {
        parameters: {
            query?: {
                days?: number;
                action?: string | null;
                section?: string | null;
                member_id?: string | null;
                include_bots?: boolean;
                limit?: number;
                offset?: number;
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
                    "application/json": components["schemas"]["UsageEventList"];
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
    usage_events_csv_v1_admin_usage_events_csv_get: {
        parameters: {
            query?: {
                days?: number;
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
                    "application/json": unknown;
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
    member_timeline_v1_admin_usage_members__member_id__get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                member_id: string;
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
                    "application/json": components["schemas"]["MemberTimeline"];
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
    usage_purge_v1_admin_usage_purge_post: {
        parameters: {
            query?: {
                days?: number | null;
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
                    "application/json": components["schemas"]["PurgeResponse"];
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
