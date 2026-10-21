// Arquivo gerado por `pnpm gen:api` (openapi-typescript). Não edite à mão.

export interface paths {
    "/v1/curtailment/sin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Curtailment Sin */
        get: operations["curtailment_sin_v1_curtailment_sin_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/curtailment/uf/{uf}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Curtailment Uf */
        get: operations["curtailment_uf_v1_curtailment_uf__uf__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/usinas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Usinas */
        get: operations["list_usinas_v1_usinas_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/usinas/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Usina */
        get: operations["get_usina_v1_usinas__slug__get"];
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
        /** Ranking */
        get: operations["ranking_v1_ranking_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/meses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Meses */
        get: operations["meses_v1_meses_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/relatorios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Relatorios */
        get: operations["list_relatorios_v1_relatorios_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/relatorios/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Relatorio */
        get: operations["get_relatorio_v1_relatorios__slug__get"];
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
        /** Subscribe */
        post: operations["subscribe_v1_newsletter_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/newsletter/confirmar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Confirm */
        get: operations["confirm_v1_newsletter_confirmar_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/newsletter/descadastrar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Unsubscribe */
        get: operations["unsubscribe_v1_newsletter_descadastrar_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/cargas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Cargas */
        get: operations["list_cargas_v1_admin_cargas_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/relatorios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All Relatorios */
        get: operations["list_all_relatorios_v1_admin_relatorios_get"];
        put?: never;
        /** Upsert Relatorio */
        post: operations["upsert_relatorio_v1_admin_relatorios_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/revalidar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revalidar */
        post: operations["revalidar_v1_admin_revalidar_post"];
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
        /** Health */
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
        /** CargaExecucao */
        CargaExecucao: {
            /** Id */
            id: number;
            /** Dataset */
            dataset: string;
            /** Periodo */
            periodo: string | null;
            /** Arquivo */
            arquivo: string | null;
            /** Hash */
            hash: string | null;
            /** Linhas */
            linhas: number | null;
            /**
             * Inicio
             * Format: date-time
             */
            inicio: string;
            /** Fim */
            fim: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "em_andamento" | "sucesso" | "falha";
            /** Detalhe */
            detalhe: string | null;
        };
        /** CargasResposta */
        CargasResposta: {
            /** Itens */
            itens: components["schemas"]["CargaExecucao"][];
        };
        /** ConfirmadoResposta */
        ConfirmadoResposta: {
            /** Confirmado */
            confirmado: boolean;
        };
        /** CurtailmentSin */
        CurtailmentSin: {
            /**
             * Fonte
             * @enum {string}
             */
            fonte: "eolica" | "solar" | "total";
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Geracao Verificada Mwh */
            geracao_verificada_mwh: number;
            /** Energia Cortada Mwh */
            energia_cortada_mwh: number;
            /** Percentual Corte */
            percentual_corte: number | null;
            /** Corte Rel Mwh */
            corte_rel_mwh: number;
            /** Corte Cnf Mwh */
            corte_cnf_mwh: number;
            /** Corte Ene Mwh */
            corte_ene_mwh: number;
            /** Corte Outros Mwh */
            corte_outros_mwh: number;
            /** Perda Estimada Brl */
            perda_estimada_brl: number | null;
            /** Usinas Afetadas */
            usinas_afetadas: number;
            /**
             * Atualizado Em
             * Format: date-time
             */
            atualizado_em: string;
            /** Subsistema */
            subsistema: string;
        };
        /** CurtailmentUf */
        CurtailmentUf: {
            /**
             * Fonte
             * @enum {string}
             */
            fonte: "eolica" | "solar" | "total";
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Geracao Verificada Mwh */
            geracao_verificada_mwh: number;
            /** Energia Cortada Mwh */
            energia_cortada_mwh: number;
            /** Percentual Corte */
            percentual_corte: number | null;
            /** Corte Rel Mwh */
            corte_rel_mwh: number;
            /** Corte Cnf Mwh */
            corte_cnf_mwh: number;
            /** Corte Ene Mwh */
            corte_ene_mwh: number;
            /** Corte Outros Mwh */
            corte_outros_mwh: number;
            /** Perda Estimada Brl */
            perda_estimada_brl: number | null;
            /** Usinas Afetadas */
            usinas_afetadas: number;
            /**
             * Atualizado Em
             * Format: date-time
             */
            atualizado_em: string;
            /** Uf */
            uf: string;
        };
        /** CurtailmentUsina */
        CurtailmentUsina: {
            /** Usina Id */
            usina_id: string;
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Geracao Verificada Mwh */
            geracao_verificada_mwh: number;
            /** Energia Cortada Mwh */
            energia_cortada_mwh: number;
            /** Percentual Corte */
            percentual_corte: number | null;
            /** Corte Rel Mwh */
            corte_rel_mwh: number;
            /** Corte Cnf Mwh */
            corte_cnf_mwh: number;
            /** Corte Ene Mwh */
            corte_ene_mwh: number;
            /** Corte Outros Mwh */
            corte_outros_mwh: number;
            /** Perda Estimada Brl */
            perda_estimada_brl: number | null;
            /** Base Preco */
            base_preco: string | null;
            /** Horas Restritas */
            horas_restritas: number;
            /** Percentual Corte Medio Uf */
            percentual_corte_medio_uf: number | null;
            /** Posicao Nacional */
            posicao_nacional: number | null;
            /** Posicao Uf */
            posicao_uf: number | null;
            /**
             * Atualizado Em
             * Format: date-time
             */
            atualizado_em: string;
        };
        /** DescadastradoResposta */
        DescadastradoResposta: {
            /** Descadastrado */
            descadastrado: boolean;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthResposta */
        HealthResposta: {
            /** Status */
            status: string;
            /** Banco */
            banco: string;
        };
        /** MensagemResposta */
        MensagemResposta: {
            /** Mensagem */
            mensagem: string;
        };
        /** MesesResposta */
        MesesResposta: {
            /** Meses */
            meses: string[];
        };
        /** NewsletterEntrada */
        NewsletterEntrada: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /**
             * Consentimento
             * @constant
             */
            consentimento: true;
            /** Origem */
            origem?: string | null;
        };
        /** RankingResposta */
        RankingResposta: {
            /** Mes */
            mes: string | null;
            /** Itens */
            itens: components["schemas"]["UsinaRanking"][];
        };
        /** Relatorio */
        Relatorio: {
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Titulo */
            titulo: string;
            /** Slug */
            slug: string;
            /** Resumo */
            resumo: string | null;
            /** Publicado Em */
            publicado_em: string | null;
            /** Conteudo */
            conteudo: string;
        };
        /** RelatorioAdmin */
        RelatorioAdmin: {
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Titulo */
            titulo: string;
            /** Slug */
            slug: string;
            /** Resumo */
            resumo: string | null;
            /** Publicado Em */
            publicado_em: string | null;
            /** Conteudo */
            conteudo: string;
            /**
             * Criado Em
             * Format: date-time
             */
            criado_em: string;
            /**
             * Atualizado Em
             * Format: date-time
             */
            atualizado_em: string;
        };
        /** RelatorioEntrada */
        RelatorioEntrada: {
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Titulo */
            titulo: string;
            /**
             * Slug
             * @description Opcional; se ausente, é gerado a partir do título.
             */
            slug?: string | null;
            /** Resumo */
            resumo?: string | null;
            /** Conteudo */
            conteudo: string;
            /** Publicar */
            publicar: boolean;
        };
        /** RelatorioResumo */
        RelatorioResumo: {
            /**
             * Mes
             * @example 2026-09
             */
            mes: string;
            /** Titulo */
            titulo: string;
            /** Slug */
            slug: string;
            /** Resumo */
            resumo: string | null;
            /** Publicado Em */
            publicado_em: string | null;
        };
        /** RelatoriosAdminResposta */
        RelatoriosAdminResposta: {
            /** Itens */
            itens: components["schemas"]["RelatorioAdmin"][];
        };
        /** RelatoriosResposta */
        RelatoriosResposta: {
            /** Itens */
            itens: components["schemas"]["RelatorioResumo"][];
        };
        /** RevalidarEntrada */
        RevalidarEntrada: {
            /** Tags */
            tags?: ("curtailment" | "usinas" | "relatorios")[];
        };
        /** RevalidarResposta */
        RevalidarResposta: {
            /** Tags */
            tags: ("curtailment" | "usinas" | "relatorios")[];
            /** Cache Limpo */
            cache_limpo: boolean;
            /** Entradas Removidas */
            entradas_removidas: number;
            /** Web Revalidado */
            web_revalidado: boolean;
            /** Detalhe */
            detalhe: string | null;
        };
        /** SinResposta */
        SinResposta: {
            /** Itens */
            itens: components["schemas"]["CurtailmentSin"][];
        };
        /** UfResposta */
        UfResposta: {
            /** Serie */
            serie: components["schemas"]["CurtailmentUf"][];
            /** Ranking */
            ranking: components["schemas"]["UsinaRanking"][];
            /** Mes Ranking */
            mes_ranking: string | null;
        };
        /** Usina */
        Usina: {
            /** Id */
            id: string;
            /**
             * Tipo
             * @enum {string}
             */
            tipo: "usina" | "conjunto";
            /** Nome */
            nome: string;
            /** Slug */
            slug: string;
            /**
             * Fonte
             * @enum {string}
             */
            fonte: "eolica" | "solar";
            /** Uf */
            uf: string;
            /** Subsistema */
            subsistema: string;
            /** Potencia Mw */
            potencia_mw: number | null;
            /** Conjunto Id */
            conjunto_id: string | null;
            /** Ceg */
            ceg: string | null;
            /** Ponto Conexao */
            ponto_conexao: string | null;
            /** Agente Operador */
            agente_operador: string | null;
            /**
             * Atualizado Em
             * Format: date-time
             */
            atualizado_em: string;
        };
        /** UsinaDetalheResposta */
        UsinaDetalheResposta: {
            usina: components["schemas"]["Usina"];
            conjunto: components["schemas"]["UsinaResumo"] | null;
            /** Usinas Do Conjunto */
            usinas_do_conjunto: components["schemas"]["UsinaResumo"][];
            /** Serie */
            serie: components["schemas"]["CurtailmentUsina"][];
        };
        /** UsinaRanking */
        UsinaRanking: {
            /** Id */
            id: string;
            /**
             * Tipo
             * @enum {string}
             */
            tipo: "usina" | "conjunto";
            /** Nome */
            nome: string;
            /** Slug */
            slug: string;
            /**
             * Fonte
             * @enum {string}
             */
            fonte: "eolica" | "solar";
            /** Uf */
            uf: string;
            /** Subsistema */
            subsistema: string;
            /** Potencia Mw */
            potencia_mw: number | null;
            /** Posicao */
            posicao: number;
            /** Energia Cortada Mwh */
            energia_cortada_mwh: number;
            /** Percentual Corte */
            percentual_corte: number | null;
            /** Perda Estimada Brl */
            perda_estimada_brl: number | null;
        };
        /** UsinaResumo */
        UsinaResumo: {
            /** Id */
            id: string;
            /**
             * Tipo
             * @enum {string}
             */
            tipo: "usina" | "conjunto";
            /** Nome */
            nome: string;
            /** Slug */
            slug: string;
            /**
             * Fonte
             * @enum {string}
             */
            fonte: "eolica" | "solar";
            /** Uf */
            uf: string;
            /** Subsistema */
            subsistema: string;
            /** Potencia Mw */
            potencia_mw: number | null;
        };
        /** UsinasResposta */
        UsinasResposta: {
            /** Itens */
            itens: components["schemas"]["UsinaResumo"][];
            /** Total */
            total: number;
            /** Pagina */
            pagina: number;
            /** Tamanho */
            tamanho: number;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
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
    curtailment_sin_v1_curtailment_sin_get: {
        parameters: {
            query?: {
                fonte?: "eolica" | "solar" | "total";
                inicio?: string | null;
                fim?: string | null;
                /** @description Opcional; sem ele, retorna todos os subsistemas e o total SIN. */
                subsistema?: ("N" | "NE" | "S" | "SE" | "SIN") | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SinResposta"];
                };
            };
            /** @description Validation Error */
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
    curtailment_uf_v1_curtailment_uf__uf__get: {
        parameters: {
            query?: {
                fonte?: "eolica" | "solar" | "total";
                mes?: string | null;
            };
            header?: never;
            path: {
                uf: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UfResposta"];
                };
            };
            /** @description Validation Error */
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
    list_usinas_v1_usinas_get: {
        parameters: {
            query?: {
                busca?: string | null;
                uf?: string | null;
                fonte?: ("eolica" | "solar") | null;
                tipo?: ("usina" | "conjunto") | null;
                pagina?: number;
                tamanho?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UsinasResposta"];
                };
            };
            /** @description Validation Error */
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
    get_usina_v1_usinas__slug__get: {
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
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UsinaDetalheResposta"];
                };
            };
            /** @description Validation Error */
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
                mes?: string | null;
                uf?: string | null;
                fonte?: "eolica" | "solar" | "total";
                limite?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RankingResposta"];
                };
            };
            /** @description Validation Error */
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
    meses_v1_meses_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MesesResposta"];
                };
            };
        };
    };
    list_relatorios_v1_relatorios_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RelatoriosResposta"];
                };
            };
        };
    };
    get_relatorio_v1_relatorios__slug__get: {
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
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Relatorio"];
                };
            };
            /** @description Validation Error */
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
                "application/json": components["schemas"]["NewsletterEntrada"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MensagemResposta"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Limite de taxa excedido */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirm_v1_newsletter_confirmar_get: {
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
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfirmadoResposta"];
                };
            };
            /** @description Token inválido ou expirado. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
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
    unsubscribe_v1_newsletter_descadastrar_get: {
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
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DescadastradoResposta"];
                };
            };
            /** @description Token inválido ou expirado. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
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
    list_cargas_v1_admin_cargas_get: {
        parameters: {
            query?: {
                limite?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CargasResposta"];
                };
            };
            /** @description Validation Error */
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
    list_all_relatorios_v1_admin_relatorios_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RelatoriosAdminResposta"];
                };
            };
        };
    };
    upsert_relatorio_v1_admin_relatorios_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RelatorioEntrada"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RelatorioAdmin"];
                };
            };
            /** @description Validation Error */
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
    revalidar_v1_admin_revalidar_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["RevalidarEntrada"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevalidarResposta"];
                };
            };
            /** @description Validation Error */
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
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResposta"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResposta"];
                };
            };
        };
    };
}
