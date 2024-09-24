package main

import (
	"fmt"
	"os"

	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/cmd"
)

func main() {
	c := cmd.NewCmdRoot()
	if err := c.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
