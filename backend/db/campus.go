package db

import (
	"log"
	"sync"
)

var (
	crushLocker = make(map[string][]string) // map[myHandle][]crushHandles
	crushMu     sync.Mutex
)

// CheckAndSetSecretCrush registers a private crush handle and evaluates mutual match convergence
func CheckAndSetSecretCrush(myDeviceID, crushHandle string) bool {
	crushMu.Lock()
	defer crushMu.Unlock()

	crushLocker[myDeviceID] = append(crushLocker[myDeviceID], crushHandle)

	// Check for mutual crush convergence
	isMutual := false
	for _, targetCrush := range crushLocker[crushHandle] {
		if targetCrush == myDeviceID {
			isMutual = true
			break
		}
	}

	log.Printf("💘 [Secret Crush] User %s marked crush on %s | Mutual Match: %t", myDeviceID, crushHandle, isMutual)
	return isMutual
}
