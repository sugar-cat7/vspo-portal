package usecase_test

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/sugar-cat7/vspo-portal/service/cron/test/testhelpers"
)

func TestMain(m *testing.M) {

	ctx := context.Background()
	c, err := testhelpers.SetupPostgresContainer(ctx)
	if err != nil {
		log.Fatal(err)
	}
	if err := c.Start(ctx); err != nil {
		log.Fatal(err)
	}

	// host, err := c.Host(ctx)
	// if err != nil {
	// 	panic(err)
	// }
	// port, err := c.MappedPort(ctx, "5432")

	// e := &environment.Environment{}
	// if err := env.Parse(e); err != nil {
	// 	panic(err)
	// }
	// testhelpers.RunUp(
	// 	fmt.Sprintf("%s:%s", host, port.Port()),
	// 	e.DatabaseEnvironment.DBUser,
	// 	e.DatabaseEnvironment.DBPassword,
	// 	e.DatabaseEnvironment.DBDatabase,
	// 	e.DatabaseEnvironment.DBSSLMode,
	// )
	// fmt.Println("Migration done", fmt.Sprintf("%s:%s", host, port.Port()))

	// time.Sleep(5 * time.Second)
	code := m.Run()

	os.Exit(code)
}
