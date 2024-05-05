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

	code := m.Run()

	os.Exit(code)
}
