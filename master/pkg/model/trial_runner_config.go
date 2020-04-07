package model

import (
	"regexp"
	"strconv"

	"github.com/pkg/errors"
)

// TrialRunnerConfig is the trial runner configurations set in master.yaml.
type TrialRunnerConfig struct {
	NetworkInterface string `json:"network_interface,omitempty"`
	NCCLPortRange    string `json:"nccl_port_range,omitempty"`
	GLOOPortRange    string `json:"gloo_port_range,omitempty"`
}

func validatePortRange(portRange string) []error {
	var errs []error

	if portRange == "" {
		return errs
	}

	re := regexp.MustCompile("^([0-9]+):([0-9]+)$")
	submatches := re.FindStringSubmatch(portRange)
	if submatches == nil {
		errs = append(
			errs, errors.Errorf("expected port range of format \"MIN:MAX\" but got %q", portRange),
		)
		return errs
	}

	var min, max uint64
	var err error
	if min, err = strconv.ParseUint(submatches[1], 10, 16); err != nil {
		errs = append(errs, errors.Wrap(err, "invalid minimum port value"))
	}
	if max, err = strconv.ParseUint(submatches[2], 10, 16); err != nil {
		errs = append(errs, errors.Wrap(err, "invalid maximum port value"))
	}

	if min > max {
		errs = append(errs, errors.Errorf("port range minimum exceeds maximum (%v > %v)", min, max))
	}

	return errs
}

// Validate implements the check.Validate interface.
func (trc *TrialRunnerConfig) Validate() []error {
	var errs []error

	if err := validatePortRange(trc.NCCLPortRange); err != nil {
		errs = append(errs, err...)
	}

	if err := validatePortRange(trc.GLOOPortRange); err != nil {
		errs = append(errs, err...)
	}

	return errs
}