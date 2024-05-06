package testhelpers

import (
	"database/sql"
	"embed"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

//go:embed migration/*.sql
var embedMigrations embed.FS

func RunUp(
	host string,
	user string,
	password string,
	dbname string,
	sslMode string,
) {
	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("postgres"); err != nil {
		panic(err)
	}
	connString := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s",
		user, password, host, dbname, sslMode)

	db, err := sql.Open("pgx", connString)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		panic(err)
	}

	if err := goose.Up(db, "migration"); err != nil {
		panic(err)
	}
}
