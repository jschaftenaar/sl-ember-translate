import Ember from 'ember';

/**
 * @module services
 * @class  translate
 */
export default Ember.Object.extend({

    // -------------------------------------------------------------------------
    // Dependencies

    // -------------------------------------------------------------------------
    // Attributes

    // -------------------------------------------------------------------------
    // Actions

    // -------------------------------------------------------------------------
    // Events

    // -------------------------------------------------------------------------
    // Properties

    /**
     * Translations
     *
     * @property {Ember.Object} dictionary
     * @default  null
     */
    dictionary: null,

    // -------------------------------------------------------------------------
    // Observers

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Set translation dictionary data
     *
     * @function setDictionary
     * @argument {Ember.Object} translations  Translation model
     * @returns  {void}
     */
    setDictionary: function( translations ) {
        this.set( 'dictionary', translations );
    },

    /**
     * Retrieve value for specified dictionary key
     *
     * @function getKeyValue
     * @argument {Ember.String} key Dictionary key to retrieve value for
     * @returns  {Ember.String}
     */
    getKeyValue: function( key ) {
        var defaultKeyValue = 'KEY__NOT__PRESENT',
            retrievedKey    = this.get( 'dictionary' ).getWithDefault( key, defaultKeyValue ),
            returnValue;

        if ( defaultKeyValue !== retrievedKey ) {
            returnValue = retrievedKey;

        } else {
            console.warn( 'No translation match for key "' + key + '".' );
            returnValue = key;
        }

        return returnValue;
    },

    /**
     * Translate provided key
     *
     * Supports
     * - singular/plural string substitution
     * - replacement of placeholder tokens in translation strings with passed parameters
     *
     * @function translateKey
     * @argument {Ember.Object} data
     * @example
     * // Example object that can be passed as argument
     * {
     *     key
     *     pluralKey
     *     pluralCount
     *     parameters: {
     *         $0: value
     *     }
     * }
     * @return {Ember.String}       Translated string
     */
    translateKey: function( data ) {

        Ember.assert( 'Argument must be supplied', data );

        if ( undefined === data ) {
            return;
        }

        data.parameters = data.parameters || {};

        var pluralErrorTracker = 0,
            token              = data.key,
            getTokenValue      = function( value ) {
                try {
                    value = this.getKeyValue( value );
                } catch ( e ) {
                    console.warn( 'Unable to translate key "' + value + '".' );
                }

                return value;
            }.bind( this ),
            translatedString;

        // BEGIN: Pluralization error checking
        if ( !Ember.isEmpty( data.pluralKey ) ) {
            pluralErrorTracker++;
        }

        if ( !Ember.isEmpty( data.pluralCount ) ) {
            pluralErrorTracker++;
        }

        if ( 1 === pluralErrorTracker ) {
            console.warn( 'If either "pluralKey" or "pluralCount" are provided then both must be.' +
                'Singular key value was returned.' );
            return getTokenValue( token );
        }
        // END: Pluralization error checking

        // Pluralization
        if ( !Ember.isEmpty( data.pluralCount ) && Number(data.pluralCount) > 1 ) {
            token = data.pluralKey;
        }

        translatedString = getTokenValue( token );

        // Parameter replacement
        Ember.keys( data.parameters ).map( function( key ) {
            translatedString = translatedString.replace( '{' + key.replace( '$', '' ) + '}' , data.parameters[key] );
        }.bind( this ) );

        return translatedString;
    }
});