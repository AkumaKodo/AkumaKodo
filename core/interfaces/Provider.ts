export interface ProviderOptions {
    provider: "mongodb" | "postgres" | "mysql" | "disabled";
    postgres_connection_url?: string;
    mysql_connection_url?: string;
    mongodb_connection_url?: string;
}
