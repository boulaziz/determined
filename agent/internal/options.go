package internal

import (
	"encoding/json"

	"github.com/pkg/errors"
)

// Options stores all the configurable options for the Determined agent.
type Options struct {
	ConfigFile string `json:"config_file"`

	MasterHost      string `json:"master_host"`
	MasterPort      int    `json:"master_port"`
	AgentID         string `json:"agent_id"`
	ArtificialSlots int    `json:"artificial_slots"`

	Label string `json:"label"`

	APIEnabled bool   `json:"api_enabled"`
	BindIP     string `json:"bind_ip"`
	BindPort   int    `json:"bind_port"`

	TLS      bool   `json:"tls"`
	CertFile string `json:"cert_file"`
	KeyFile  string `json:"key_file"`
}

// Validate validates the state of the Options struct.
func (o Options) Validate() []error {
	return []error{
		o.validateTLS(),
	}
}

func (o Options) validateTLS() error {
	if !o.TLS || !o.APIEnabled {
		return nil
	}
	if o.CertFile == "" {
		return errors.New("TLS cert file not specified")
	}
	if o.KeyFile == "" {
		return errors.New("TLS key file not specified")
	}
	return nil
}

// Printable returns a printable string.
func (o Options) Printable() ([]byte, error) {
	optJSON, err := json.Marshal(o)
	if err != nil {
		return nil, errors.Wrap(err, "unable to convert config to JSON")
	}
	return optJSON, nil
}