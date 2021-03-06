package scheduler

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/docker/docker/pkg/jsonmessage"

	"github.com/determined-ai/determined/master/pkg/agent"
	containerInfo "github.com/determined-ai/determined/master/pkg/container"
)

// ContainerLog notifies the task actor that a new log message is available for the container.
type ContainerLog struct {
	Container containerInfo.Container
	Timestamp time.Time

	PullMessage *jsonmessage.JSONMessage
	RunMessage  *agent.RunMessage
	AuxMessage  *string
}

func (c ContainerLog) String() string {
	msg := ""
	switch {
	case c.AuxMessage != nil:
		msg = *c.AuxMessage
	case c.RunMessage != nil:
		msg = strings.TrimSuffix(c.RunMessage.Value, "\n")
	case c.PullMessage != nil:
		buf := new(bytes.Buffer)
		if err := c.PullMessage.Display(buf, false); err != nil {
			msg = err.Error()
		} else {
			msg = buf.String()
			// Docker disables printing the progress bar in non-terminal mode.
			if msg == "" && c.PullMessage.Progress != nil {
				msg = c.PullMessage.Progress.String()
			}
			msg = strings.TrimSpace(msg)
		}
	default:
		panic("unknown log message received")
	}
	shortID := c.Container.ID[:8]
	timestamp := c.Timestamp.UTC().Format(time.RFC3339)
	return fmt.Sprintf("[%s] %s [%s] || %s", timestamp, shortID, c.Container.State, msg)
}
